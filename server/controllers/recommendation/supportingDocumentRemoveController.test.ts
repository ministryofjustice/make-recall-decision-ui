import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { deleteSupportingDocument, getSupportingDocuments } from '../../data/makeDecisionApiClient'
import supportingDocumentRemoveController from './supportingDocumentRemoveController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const PPUDPartA = {
      title: '',
      type: 'PPUDPartA',
      filename: 'NAT_Recall_Part_A_02022024_Bloggs_H_X098092.docx',
      id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
    }

    ;(getSupportingDocuments as jest.Mock).mockReturnValueOnce([PPUDPartA])

    const req = mockReq({
      params: {
        id: 'e0cc157d-5c31-4c2f-984f-4bc7b5491d9d',
        recommendationId: '123',
      },
    })
    const res = mockRes()
    const next = mockNext()
    await supportingDocumentRemoveController.get(req, res, next)

    expect(getSupportingDocuments).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      featureFlags: {},
    })

    expect(res.locals.page).toEqual({ id: 'supportingDocumentRemove' })
    expect(res.locals.document).toEqual(PPUDPartA)
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/supportingDocumentRemove')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with file', async () => {
    const req = mockReq({
      params: {
        recommendationId: '1234',
        id: '456',
      },
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()
    await supportingDocumentRemoveController.post(req, res, next)

    expect(deleteSupportingDocument).toHaveBeenCalledWith({
      featureFlags: {},
      recommendationId: '1234',
      token: 'token1',
      id: '456',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1234/supporting-documents`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
