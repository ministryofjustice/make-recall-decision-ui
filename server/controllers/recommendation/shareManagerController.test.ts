import shareManagerController from './shareManagerController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await shareManagerController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'shareCaseWithManager' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/shareCaseWithManager')
    expect(res.locals.link).toEqual('some-link-for-later/123')

    expect(next).toHaveBeenCalled()
  })
})
