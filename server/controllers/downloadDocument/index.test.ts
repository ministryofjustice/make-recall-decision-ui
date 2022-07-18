import { NextFunction, Request, Response } from 'express'
import { downloadDocument } from './index'
import { getDocumentContents } from '../../data/makeDecisionApiClient'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

jest.mock('../../data/makeDecisionApiClient')

const crn = '123'
const documentId = '88'

describe('downloadDocument', () => {
  const downloadFileContents = 'file contents'
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = mockReq({ params: { crn, documentId } })
    res = mockRes()
    next = jest.fn()
  })

  it('should serve a document', async () => {
    const fileName = '2022-05-04-contact-doc.pdf'
    const headers = {
      'Content-Disposition': `attachment; filename="${fileName}"`,
    }
    ;(getDocumentContents as jest.Mock).mockResolvedValue({
      body: downloadFileContents,
      headers,
    })
    await downloadDocument(req, res, next)
    expect(res.set).toHaveBeenCalledWith(headers)
    expect(res.send).toHaveBeenCalledWith(downloadFileContents)
  })
})
