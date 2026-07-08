import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { sharedPaths } from '../../routes/paths/shared.paths'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import chargedWithOffenceController from './chargedWithOffenceController'
import ppPaths from '../../routes/paths/pp.paths'
import { IsRecalledOnNewChargedOrConvictedOffence } from '../../@types/make-recall-decision-api/models/IsRecalledOnNewChargedOrConvictedOffence'
import chargedWithOffenceOptions from '../recommendations/chargedWithOffence/formOptions'
import { stripHtmlTags } from '../../utils/utils'

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
        recommendation: RecommendationResponseGenerator.generate(),
      },
    })
    const req = mockReq()

    await chargedWithOffenceController.post(req, res, mockNext())

    expect(req.session).toEqual({
      errors: [
        {
          errorId: 'missingisRecalledOnNewChargedOrConvictedOffence',
          text: 'Select if {{ fullName }} has been charged or convicted for an offence',
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
        isRecalledOnNewChargedOrConvictedOffence: IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
      },
    })

    const res = mockRes({})

    await chargedWithOffenceController.post(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalledWith({
      valuesToSave: {
        isRecalledOnNewChargedOrConvictedOffence: {
          selected: IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
          allOptions: [
            ...chargedWithOffenceOptions.map(option => ({ value: option.value, text: stripHtmlTags(option.html) })),
          ],
        },
      },
      featureFlags: {},
      token: 'token',
      recommendationId: '123',
    })

    expect(res.redirect).toHaveBeenCalledWith(
      303,
      `${sharedPaths.recommendations}/123/${ppPaths.suitabilityForFixedTermRecall}`,
    )
  })

  it('resets existing data when the previously selected option has changed', async () => {
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        isRecalledOnNewChargedOrConvictedOffence: IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
      },
    })

    const res = mockRes({
      locals: {
        recommendation: RecommendationResponseGenerator.generate({
          isRecalledOnNewChargedOrConvictedOffence: {
            selected: IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
          },
        }),
      },
    })

    await chargedWithOffenceController.post(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalledWith({
      valuesToSave: {
        isRecalledOnNewChargedOrConvictedOffence: {
          selected: IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
          allOptions: [
            ...chargedWithOffenceOptions.map(option => ({ value: option.value, text: stripHtmlTags(option.html) })),
          ],
        },
        fixedTermAdditionalLicenceConditions: {
          details: null,
          selected: null,
        },
        isAtRiskOfInvolvedInForeignPowerThreat: null,
        isChargedWithOffence: null,
        isServingDCRSentence: null,
        isServingSOPCSentence: null,
        isServingTerroristOrNationalSecurityOffence: null,
        isYouthChargedWithSeriousOffence: null,
        isYouthSentenceOver12Months: null,
        recallType: {
          allOptions: [],
          selected: null,
        },
        wasReferredToParoleBoard244ZB: null,
        wasRepatriatedForMurder: null,
      },
      featureFlags: {},
      token: 'token',
      recommendationId: '123',
    })

    expect(res.redirect).toHaveBeenCalledWith(
      303,
      `${sharedPaths.recommendations}/123/${ppPaths.suitabilityForFixedTermRecall}`,
    )
  })
})
