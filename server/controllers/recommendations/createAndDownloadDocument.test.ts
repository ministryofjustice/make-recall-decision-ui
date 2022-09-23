import { Response } from 'express'
import { createAndDownloadDocument } from './createAndDownloadDocument'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { createDocument } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

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
    const req = mockReq({ params: { recommendationId } })
    await createAndDownloadDocument('PART_A')(req, res)
    expect(createDocument).toHaveBeenCalledWith(recommendationId, 'part-a', { userEmail: 'dave@gov.uk' }, token)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))

    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })

  it('requests a no recall letter', async () => {
    const fileContents = '123'
    const fileName = 'Letter.docx'
    ;(createDocument as jest.Mock).mockReturnValueOnce({ fileContents, fileName })
    const req = mockReq({ params: { recommendationId } })
    await createAndDownloadDocument('NO_RECALL_LETTER')(req, res)
    expect(createDocument).toHaveBeenCalledWith(recommendationId, 'no-recall-letter', {}, token)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(fileContents, 'base64'))

    expect(res.contentType).toHaveBeenCalledWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
  })
})
