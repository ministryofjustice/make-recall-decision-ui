import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import apRationaleConfirmationController from './apRationaleConfirmationController'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load record decision', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          crn: 'X123F',
          personOnProbation: {
            nomsNumber: '123X',
            name: 'Stiffy McBoveration',
          },
        },
      },
    })
    const next = mockNext()
    await apRationaleConfirmationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'apRationaleConfirmation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/apRationaleConfirmation')

    expect(res.locals.nomsNumber).toEqual('123X')
    expect(res.locals.crn).toEqual('X123F')
    expect(res.locals.personOnProbation).toEqual('Stiffy McBoveration')
    expect(next).toHaveBeenCalled()
  })
})
