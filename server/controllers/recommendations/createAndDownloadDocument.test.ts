import { createAndDownloadDocument } from './createAndDownloadDocument'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { AuditService } from '../../services/auditService'
import { createDocument, getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

const recommendationId = '987'
const token = 'token'
const featureFlags = {}

describe('createAndDownloadDocument', () => {
  it('requests a Part A', async () => {
    const fileContents = '123'
    const fileName = 'Part-A.docx'
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName })
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    jest.spyOn(AuditService.prototype, 'createPartA')

    const req = mockReq({ params: { recommendationId }, query: { crn: 'AB1234C' } })

    const res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          email: 'dave@gov.uk',
          roles: [HMPPS_AUTH_ROLE.PO],
          region: { code: 'N07', name: 'London' },
        },
        flags: featureFlags,
      },
    })

    await createAndDownloadDocument('PART_A')(req, res)

    expect(createDocument).toHaveBeenCalledWith(
      '987',
      'part-a',
      { format: 'download-docx', userEmail: 'dave@gov.uk' },
      'token',
      {}
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '987',
      token: 'token',
      activate: [STATUSES.PP_DOCUMENT_CREATED],
      deActivate: [],
    })

    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdPartADocumentDownloaded',
      'Dave',
      {
        crn: 'AB1234C',
        recommendationId: '987',
        region: { code: 'N07', name: 'London' },
      },
      featureFlags
    )
    expect(AuditService.prototype.createPartA).toHaveBeenCalledWith({
      crn: 'AB1234C',
      logErrors: false,
      recommendationId: '987',
      username: 'Dave',
    })
    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })

  it('close document', async () => {
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents: '123', fileName: 'Part-A.docx' })
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_RECORDED_RATIONALE, active: true }])

    const req = mockReq({ params: { recommendationId }, query: { crn: 'AB1234C' } })

    const res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          email: 'dave@gov.uk',
          roles: [HMPPS_AUTH_ROLE.PO],
        },
        flags: featureFlags,
      },
    })

    await createAndDownloadDocument('PART_A')(req, res)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '987',
      token: 'token',
      activate: [STATUSES.PP_DOCUMENT_CREATED, STATUSES.CLOSED],
      deActivate: [],
    })
  })

  it('do not close document if SPO', async () => {
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents: '123', fileName: 'Part-A.docx' })
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_RECORDED_RATIONALE, active: true }])
    // jest.spyOn(AuditService.prototype, 'createPartA')

    const req = mockReq({ params: { recommendationId }, query: { crn: 'AB1234C' } })

    const res = mockRes({
      token,
      locals: {
        user: {
          username: 'Dave',
          email: 'dave@gov.uk',
          roles: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO],
        },
        flags: featureFlags,
      },
    })

    await createAndDownloadDocument('PART_A')(req, res)

    expect(updateStatuses).not.toHaveBeenCalled()
  })

  it('do not mark DNTR as completed, if already set', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.COMPLETED,
        active: true,
      },
    ])
    const fileContents = '123'
    const fileName = 'Letter.docx'
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName })
    jest.spyOn(AuditService.prototype, 'createNoRecallLetter')

    const req = mockReq({ params: { recommendationId }, query: { crn: 'AB1234C' } })

    const res = mockRes({
      token,
      locals: { user: { username: 'Dave', email: 'dave@gov.uk', roles: [HMPPS_AUTH_ROLE.PO] }, flags: featureFlags },
    })

    await createAndDownloadDocument('NO_RECALL_LETTER')(req, res)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '987',
      token: 'token',
      activate: [STATUSES.PP_DOCUMENT_CREATED],
      deActivate: [],
    })
  })

  it('requests a no recall letter', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const fileContents = '123'
    const fileName = 'Letter.docx'
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName })
    jest.spyOn(AuditService.prototype, 'createNoRecallLetter')

    const req = mockReq({ params: { recommendationId }, query: { crn: 'AB1234C' } })

    const res = mockRes({
      token,
      locals: { user: { username: 'Dave', email: 'dave@gov.uk', roles: [HMPPS_AUTH_ROLE.PO] }, flags: featureFlags },
    })

    await createAndDownloadDocument('NO_RECALL_LETTER')(req, res)

    expect(createDocument).toHaveBeenCalledWith('987', 'no-recall-letter', { format: 'download-docx' }, 'token', {})

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '987',
      token: 'token',
      activate: [STATUSES.PP_DOCUMENT_CREATED, STATUSES.COMPLETED],
      deActivate: [],
    })

    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdDecisionNotToRecallLetterDownloaded',
      'Dave',
      {
        crn: 'AB1234C',
        recommendationId: '987',
      },
      featureFlags
    )
    expect(AuditService.prototype.createNoRecallLetter).toHaveBeenCalledWith({
      crn: 'AB1234C',
      logErrors: false,
      recommendationId: '987',
      username: 'Dave',
    })
    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })
})
