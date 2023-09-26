import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import previewPartAController from './previewPartAController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await previewPartAController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'previewPartA' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/previewPartA')
    expect(next).toHaveBeenCalled()
  })
})
