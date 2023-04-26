import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import sensitiveInfoController from './sensitiveInfoController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await sensitiveInfoController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'sensitiveInformation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/sensitiveInformation')

    expect(next).toHaveBeenCalled()
  })
})
