import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import chargedWithOffenceController from './chargedWithOffenceController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('loads the page correctly', async () => {
    const res = mockRes({
      locals: {},
    })

    const next = mockNext()

    await chargedWithOffenceController.get(mockReq(), res, next)

    expect(res.locals.page.id).toEqual('chargedWithOffence')
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/chargedWithOffence')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  beforeEach(() => {
    ;(updateRecommendation as jest.Mock).mockResolvedValueOnce({})
  })

  it('with invalid data', async () => {
    const res = mockRes({
      locals: {
        recommendation: RecommendationResponseGenerator.generate({ personOnProbation: { name: 'John Smith' } }),
      },
    })
    const req = mockReq()

    await chargedWithOffenceController.post(req, res, mockNext())

    expect(req.session).toEqual({
      errors: [
        {
          errorId: 'missingisRecalledOnNewChargedOrConvictedOffence',
          text: 'Select if John Smith has been charged or convicted for an offence',
          name: 'isRecalledOnNewChargedOrConvictedOffence',
          values: undefined,
          invalidParts: undefined,
          href: '#isRecalledOnNewChargedOrConvictedOffence',
        },
      ],
    })
    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalled()
  })

  it('with valid data', async () => {
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        isRecalledOnNewChargedOrConvictedOffence: 'NO',
      },
    })

    const res = mockRes({})

    await chargedWithOffenceController.post(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalledWith({
      valuesToSave: {
        isRecalledOnNewChargedOrConvictedOffence: 'NO',
      },
      featureFlags: {},
      token: 'token',
      recommendationId: '123',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/suitability-for-fixed-term-recall')
  })
})
