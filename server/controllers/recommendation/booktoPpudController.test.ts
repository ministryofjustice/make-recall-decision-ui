import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { bookRecallToPpud, updateStatuses } from '../../data/makeDecisionApiClient'
import bookToPpudController from './bookToPpudController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const basePath = `/recommendations/1/`
    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        recommendation: {
          personOnProbation: {
            nomsNumber: 'A1234',
          },
          bookRecallToPpud: {
            decisionDateTime: '2023-11-13T09:49:31.361Z',
          },
        },
      },
    })
    const next = mockNext()

    await bookToPpudController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(bookRecallToPpud).toHaveBeenCalledWith('token', 'A1234', {
      decisionDateTime: '2023-11-13T09:49:31.361Z',
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKED_TO_PPUD', 'REC_CLOSED'],
      deActivate: [],
      recommendationId: '123',
      token: 'token',
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/booked-to-ppud`)
    expect(next).not.toHaveBeenCalled()
  })
})
