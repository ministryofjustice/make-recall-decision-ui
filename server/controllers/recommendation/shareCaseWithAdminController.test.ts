import shareCaseWithAdminController from './shareCaseWithAdminController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Joe Bloggs' } },
      },
    })
    const next = mockNext()
    await shareCaseWithAdminController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'shareCaseWithAdmin' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/shareCaseWithAdmin')
    expect(res.locals.link).toEqual('http://localhost:3000/recommendations/123/task-list')

    expect(next).toHaveBeenCalled()
  })
})
