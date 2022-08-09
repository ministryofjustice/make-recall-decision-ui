import { Response } from 'express'
import { createAndDownloadPartA } from './createAndDownloadPartA'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { createPartA } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

const recommendationId = '987'
let res: Response
const token = 'token'

describe('createAndDownloadPartA', () => {
  beforeEach(() => {
    res = mockRes({ token, locals: { user: { username: 'Dave' } } })
  })

  it('calls the API', async () => {
    const fileContents = '123'
    const fileName = 'Part-A.docx'
    ;(createPartA as jest.Mock).mockReturnValueOnce({ fileContents, fileName })
    const req = mockReq({ params: { recommendationId } })
    await createAndDownloadPartA(req, res)
    expect(createPartA).toHaveBeenCalledWith(recommendationId, token)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))

    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })
})
