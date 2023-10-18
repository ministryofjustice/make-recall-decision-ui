import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import spoSeniorManagerEndorsementController from './spoSeniorManagerEndorsementController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await spoSeniorManagerEndorsementController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'spoSeniorManagementEndorsement' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoSeniorManagerEndorsement')

    expect(next).toHaveBeenCalled()
  })
})
