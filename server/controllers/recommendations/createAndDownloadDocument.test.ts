import { Response } from 'express'
import { createAndDownloadDocument } from './createAndDownloadDocument'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { createDocument } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { AuditService } from '../../services/auditService'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

const recommendationId = '987'
let res: Response
const token = 'token'

describe('createAndDownloadDocument', () => {
  beforeEach(() => {
    res = mockRes({ token, locals: { user: { username: 'Dave', email: 'dave@gov.uk' } } })
  })

  it('requests a Part A', async () => {
    const fileContents = '123'
    const fileName = 'Part-A.docx'
    ;(createDocument as jest.Mock).mockReturnValueOnce({ fileContents, fileName })
    jest.spyOn(AuditService.prototype, 'createPartA')
    const req = mockReq({ params: { recommendationId }, query: { crn: 'AB1234C' } })
    await createAndDownloadDocument('PART_A')(req, res)
    expect(createDocument).toHaveBeenCalledWith(
      recommendationId,
      'part-a',
      { format: 'download-docx', userEmail: 'dave@gov.uk' },
      token
    )
    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))
    expect(appInsightsEvent).toHaveBeenCalledWith('mrdPartADocumentDownloaded', 'AB1234C', 'Dave', '987')
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

  it('requests a no recall letter', async () => {
    const fileContents = '123'
    const fileName = 'Letter.docx'
    ;(createDocument as jest.Mock).mockReturnValueOnce({ fileContents, fileName })
    jest.spyOn(AuditService.prototype, 'createNoRecallLetter')
    const req = mockReq({ params: { recommendationId }, query: { crn: 'AB1234C' } })
    await createAndDownloadDocument('NO_RECALL_LETTER')(req, res)
    expect(createDocument).toHaveBeenCalledWith(
      recommendationId,
      'no-recall-letter',
      { format: 'download-docx' },
      token
    )
    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))
    expect(appInsightsEvent).toHaveBeenCalledWith('mrdDecisionNotToRecallLetterDownloaded', 'AB1234C', 'Dave', '987')
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
