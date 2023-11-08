import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

import ppcsSearchController from './ppcsSearchController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await ppcsSearchController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'ppcsSearch' })
    expect(res.render).toHaveBeenCalledWith('pages/ppcsSearch')

    expect(next).toHaveBeenCalled()
  })
})
