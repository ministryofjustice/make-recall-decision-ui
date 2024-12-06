import { createAndDownloadDocument } from './createAndDownloadDocument'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { AuditService } from '../../services/auditService'
import { createDocument, getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { DOCUMENT_TYPE } from '../../@types/make-recall-decision-api/models/DocumentType'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

const recommendationId = '987'
const userName = 'Dave'
const userEmail = 'dave@gov.uk'
const userRegion = { code: 'N07', name: 'London' }
const crn = 'AB1234C'
const token = 'token'
const featureFlags = {}
const fileContents = '123'

const poRoleArray = [HMPPS_AUTH_ROLE.PO]
const spoRoleArray = [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO]

describe('createAndDownloadDocument', () => {
  it.each([[poRoleArray], [spoRoleArray]])('requests a Part A', async userRoles => {
    const fileName = 'Part-A.docx'
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName })
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    jest.spyOn(AuditService.prototype, 'createPartA')

    const req = mockReq({ params: { recommendationId }, query: { crn } })

    const res = mockRes({
      token,
      locals: {
        user: {
          username: userName,
          email: userEmail,
          roles: userRoles,
          region: userRegion,
        },
        flags: featureFlags,
      },
    })

    await createAndDownloadDocument(DOCUMENT_TYPE.PART_A)(req, res)

    expect(createDocument).toHaveBeenCalledWith(
      recommendationId,
      'part-a',
      { format: 'download-docx', userEmail },
      token,
      {},
      false
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId,
      token,
      activate: [STATUSES.PP_DOCUMENT_CREATED],
      deActivate: [],
    })

    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdPartADocumentDownloaded',
      userName,
      {
        crn,
        recommendationId,
        region: userRegion,
      },
      featureFlags
    )
    expect(AuditService.prototype.createPartA).toHaveBeenCalledWith({
      crn,
      logErrors: false,
      recommendationId,
      username: userName,
    })
    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })

  it('requests a Preview Part A', async () => {
    const fileName = 'Preview_Part-A.docx'
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName })
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    jest.spyOn(AuditService.prototype, 'createPartA')

    const req = mockReq({ params: { recommendationId }, query: { crn } })

    const res = mockRes({
      token,
      locals: {
        user: {
          username: userName,
          email: userEmail,
          roles: poRoleArray,
          region: userRegion,
        },
        flags: featureFlags,
      },
    })

    await createAndDownloadDocument(DOCUMENT_TYPE.PREVIEW_PART_A)(req, res)

    expect(createDocument).toHaveBeenCalledWith(
      recommendationId,
      'part-a',
      { format: 'download-docx', userEmail },
      token,
      {},
      true
    )

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))
    expect(appInsightsEvent).not.toHaveBeenCalled()
    expect(AuditService.prototype.createPartA).not.toHaveBeenCalled()
    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })

  it.each([[poRoleArray], [spoRoleArray]])('sent to ppcs', async userRoles => {
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName: 'Part-A.docx' })
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_RECORDED_RATIONALE, active: true }])

    const req = mockReq({ params: { recommendationId }, query: { crn } })

    const res = mockRes({
      token,
      locals: {
        user: {
          username: userName,
          email: userEmail,
          roles: userRoles,
        },
        flags: {},
      },
    })

    await createAndDownloadDocument(DOCUMENT_TYPE.PART_A)(req, res)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId,
      token,
      activate: [STATUSES.PP_DOCUMENT_CREATED, STATUSES.SENT_TO_PPCS],
      deActivate: [],
    })
  })

  it('do not mark DNTR as completed or downloaded, if already set', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.REC_CLOSED,
        active: true,
      },
    ])
    const fileName = 'Letter.docx'
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName })
    jest.spyOn(AuditService.prototype, 'createNoRecallLetter')

    const req = mockReq({ params: { recommendationId }, query: { crn } })

    const res = mockRes({
      token,
      locals: { user: { username: userName, email: userEmail, roles: poRoleArray }, flags: featureFlags },
    })

    await createAndDownloadDocument(DOCUMENT_TYPE.NO_RECALL_LETTER)(req, res)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId,
      token,
      activate: [STATUSES.PP_DOCUMENT_CREATED],
      deActivate: [],
    })
  })

  it('requests a no recall letter', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const fileName = 'Letter.docx'
    ;(createDocument as jest.Mock).mockResolvedValue({ fileContents, fileName })
    jest.spyOn(AuditService.prototype, 'createNoRecallLetter')

    const req = mockReq({ params: { recommendationId }, query: { crn } })

    const res = mockRes({
      token,
      locals: { user: { username: userName, email: userEmail, roles: poRoleArray }, flags: featureFlags },
    })

    await createAndDownloadDocument(DOCUMENT_TYPE.NO_RECALL_LETTER)(req, res)

    expect(createDocument).toHaveBeenCalledWith(
      recommendationId,
      'no-recall-letter',
      { format: 'download-docx' },
      token,
      {},
      false
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId,
      token,
      activate: [STATUSES.PP_DOCUMENT_CREATED, STATUSES.REC_CLOSED],
      deActivate: [],
    })

    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdDecisionNotToRecallLetterDownloaded',
      userName,
      {
        crn,
        recommendationId,
      },
      featureFlags
    )
    expect(AuditService.prototype.createNoRecallLetter).toHaveBeenCalledWith({
      crn,
      logErrors: false,
      recommendationId,
      username: userName,
    })
    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })
})
