import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import supportingDocumentDownloadController from './supportingDocumentDownloadController'
import { downloadSupportingDocument } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(downloadSupportingDocument as jest.Mock).mockResolvedValue({
      filename: 'file.pdf',
      data: 'c29tZSBkYXRh',
    })

    const req = mockReq({
      params: {
        id: '1234',
        recommendationId: '456',
      },
    })
    const res = mockRes()
    const next = mockNext()
    await supportingDocumentDownloadController.get(req, res, next)

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/octet-stream',
      'Content-disposition': 'attachment;filename=file.pdf',
      'Content-Length': 'some data'.length,
    })

    expect(res.end).toHaveBeenCalledWith(Buffer.from('some data', 'binary'))
    expect(next).toHaveBeenCalled()
  })
})
