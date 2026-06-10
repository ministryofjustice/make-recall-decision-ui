import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import suitabilityForFixedTermRecallController from './suitabilityForFixedTermRecallController'
import getCaseSection from '../caseSummary/getCaseSection'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { nextPagePreservingFromPageAndAnchor } from '../recommendations/helpers/urls'
import { isRecommendationDiscretionaryRecall } from '../../utils/fixedTermRecallUtils'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../caseSummary/getCaseSection')
jest.mock('../recommendations/helpers/urls')
jest.mock('../../utils/fixedTermRecallUtils')

describe('get', () => {
  beforeEach(() => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { licence: 'case summary data' },
    })
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { mappa: 'mappa summary data' },
    })
  })

  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: {
            name: faker.person.fullName(),
          },
          recallType: null,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
    expect(res.locals.caseSummary).toEqual({ licence: 'case summary data', mappa: 'mappa summary data' })
    expect(res.locals.page).toEqual({ id: 'suitabilityForFixedTermRecall' })

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall-ftr56')
    expect(next).toHaveBeenCalled()
  })

  it('load with errors', async () => {
    const res = mockRes({
      locals: {
        unsavedValues: {
          isSentence12MonthsOrOver: 'YES',
          isMappaLevelAbove1: 'NO',
          hasBeenConvictedOfSeriousOffence: 'YES',
        },
        recommendation: {
          isSentence48MonthsOrOver: true,
          isUnder18: true,
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
          isRecalledOnNewChargedOffence: true,
          isServingFTSentenceForTerroristOffence: true,
          hasBeenChargedWithTerroristOrStateThreatOffence: true,
          personOnProbation: {
            name: faker.person.fullName(),
          },
        },
        token: 'token1',
        errors: [
          {
            name: 'isUnder18',
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isUnder18',
            errorId: 'noIsUnder18',
          },
        ],
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.errors[0]).toEqual({
      name: 'isUnder18',
      text: 'Select whether {{ fullName }} is 18 or over',
      href: '#isUnder18',
      errorId: 'noIsUnder18',
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: [
          {
            name: 'isUnder18',
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isUnder18',
            errorId: 'noIsUnder18',
          },
        ],
        recommendation: {
          personOnProbation: {
            name: faker.person.fullName(),
          },
        },
        token: 'token1',
      },
    })

    await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors[0]).toEqual({
      name: 'isUnder18',
      text: 'Select whether {{ fullName }} is 18 or over',
      href: '#isUnder18',
      errorId: 'noIsUnder18',
    })
  })

  describe('redirects when FTR56 flag is enabled and sentenceGroup is not Determinate', () => {
    ;[SentenceGroup.INDETERMINATE, SentenceGroup.EXTENDED].forEach(testCase => {
      it(`redirects when sentence group is ${testCase}`, async () => {
        const res = mockRes({
          locals: {
            recommendation: {
              id: '1',
              sentenceGroup: testCase,
            },
            token: 'token1',
          },
        })

        await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

        expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/indeterminate-details`)
      })
    })
  })

  it('shows the warning banner when FTR56 is enabled, the sentenceGroup is YOUTH_SDS and the recallType is not null', async () => {
    ;(isRecommendationDiscretionaryRecall as jest.Mock).mockReturnValueOnce(true)
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: {
            name: 'Test McTest',
          },
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          recallType: '123',
        },
      },
    })

    await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.page.warningPanel).toEqual({
      body: `Changing your answers could make Test McTest eligible for a mandatory fixed term recall. If this happens, information explaining your previous recall type selection will be deleted.`,
      title: 'Changes could affect your recall recommendation choices',
    })
  })

  it('does not show the warning banner when FTR56 flag is enabled and sentenceGRoup is ADULT_SDS', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: {
            name: 'Test McTest',
          },
          sentenceGroup: SentenceGroup.ADULT_SDS,
          recallType: '123',
        },
      },
    })

    await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.page.warningPanel).toBe(undefined)
  })

  it('renders the correct template when FTR56 flag is enabled', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: {
            name: faker.person.fullName(),
          },
        },
      },
    })

    await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall-ftr56')
  })
})

describe('post', () => {
  const expectedResolvedRedirectUrl = faker.internet.url()
  beforeEach(() => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(nextPagePreservingFromPageAndAnchor as jest.Mock).mockReturnValue(expectedResolvedRedirectUrl)
  })
  const basePath = `/recommendations/123/`

  describe('post with valid data FTR56', () => {
    ;[
      {
        recommendationOptions: {
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
          isYouthSentenceOver12Months: true,
          isYouthChargedWithSeriousOffence: true,
        },
        postBody: {
          // NB: Whilst the MAPPA category 4 value isn't relevant to the mandatory FTR criteria,
          // it's still required in the Part A so we're just checking it's being updated in the API
          isMappaCategory4: 'YES',
          isMappaLevel2Or3: 'YES',
          isYouthSentenceOver12Months: 'YES',
          isYouthChargedWithSeriousOffence: 'YES',
        },
        recallTypePreserved: true,
      },
      {
        recommendationOptions: {
          sentenceGroup: SentenceGroup.YOUTH_SDS,
          isMappaCategory4: false,
          isMappaLevel2Or3: false,
          isYouthSentenceOver12Months: false,
          isYouthChargedWithSeriousOffence: false,
        },
        postBody: {
          // NB: Whilst the MAPPA category 4 value isn't relevant to the mandatory FTR criteria,
          // it's still required in the Part A so we're just checking it's being updated in the API
          isMappaCategory4: 'YES',
          isMappaLevel2Or3: 'YES',
          isYouthSentenceOver12Months: 'YES',
          isYouthChargedWithSeriousOffence: 'YES',
        },
        recallTypePreserved: false,
      },
      {
        recommendationOptions: {
          sentenceGroup: SentenceGroup.ADULT_SDS,
          isChargedWithOffence: true,
          isServingTerroristOrNationalSecurityOffence: true,
          isAtRiskOfInvolvedInForeignPowerThreat: true,
          wasReferredToParoleBoard244ZB: true,
          wasRepatriatedForMurder: true,
          isServingSOPCSentence: true,
          isServingDCRSentence: true,
        },
        postBody: {
          isChargedWithOffence: 'YES',
          isServingTerroristOrNationalSecurityOffence: 'YES',
          isAtRiskOfInvolvedInForeignPowerThreat: 'YES',
          wasReferredToParoleBoard244ZB: 'YES',
          wasRepatriatedForMurder: 'YES',
          isServingSOPCSentence: 'YES',
          isServingDCRSentence: 'YES',
        },
        recallTypePreserved: true,
      },
      {
        recommendationOptions: {
          sentenceGroup: SentenceGroup.ADULT_SDS,
          isChargedWithOffence: true,
          isServingTerroristOrNationalSecurityOffence: true,
          isAtRiskOfInvolvedInForeignPowerThreat: true,
          wasReferredToParoleBoard244ZB: true,
          wasRepatriatedForMurder: true,
          isServingSOPCSentence: true,
          isServingDCRSentence: true,
        },
        postBody: {
          isChargedWithOffence: 'NO',
          isServingTerroristOrNationalSecurityOffence: 'NO',
          isAtRiskOfInvolvedInForeignPowerThreat: 'NO',
          wasReferredToParoleBoard244ZB: 'NO',
          wasRepatriatedForMurder: 'NO',
          isServingSOPCSentence: 'NO',
          isServingDCRSentence: 'NO',
        },
        recallTypePreserved: false,
      },
    ].forEach(testCase => {
      it(`${testCase.recallTypePreserved ? 'does not clear' : 'clears'} the recallType and rationale if the criteria has ${testCase.recallTypePreserved ? 'not ' : ''}changed`, async () => {
        const req = mockReq({
          params: { recommendationId: '123' },
          body: {
            ...testCase.postBody,
          },
        })
        const priorRecommendation = RecommendationResponseGenerator.generate({
          recallType: 'any',
          ...testCase.recommendationOptions,
        })
        const res = mockRes({
          token: 'token1',
          locals: {
            recommendation: priorRecommendation,
            urlInfo: { basePath },
            statuses: [],
          },
        })
        const next = mockNext()

        await suitabilityForFixedTermRecallController.post(req, res, next)

        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId: '123',
          token: 'token1',
          valuesToSave: {
            ...Object.fromEntries(Object.entries(testCase.postBody).map(([key, value]) => [key, value === 'YES'])),
            ...(!testCase.recallTypePreserved
              ? {
                  recallType: {
                    selected: { value: null },
                    allOptions: priorRecommendation.recallType.allOptions,
                  },
                }
              : {}),
          },
          featureFlags: {},
        })

        expect(res.redirect).toHaveBeenCalledWith(303, expectedResolvedRedirectUrl)
        expect(next).not.toHaveBeenCalled() // end of the line for posts.
      })
    })
  })

  it('post with invalid data', async () => {
    const req = mockReq({
      params: { recommendationId: '123' },
      originalUrl: 'some-url',
      body: {
        isUnder18: '',
        isSentence48MonthsOrOver: '',
        isMappaCategory4: '',
        isMappaLevel2Or3: '',
        isRecalledOnNewChargedOffence: '',
        isServingFTSentenceForTerroristOffence: '',
        hasBeenChargedWithTerroristOrStateThreatOffence: '',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: faker.person.fullName() } },
        urlInfo: { basePath },
        statuses: [],
      },
    })
    const next = mockNext()

    await suitabilityForFixedTermRecallController.post(req, res, next)
    expect(updateRecommendation).not.toHaveBeenCalled()

    expect(req.session.errors).toEqual([
      {
        name: 'isYouthSentenceOver12Months',
        text: "Select whether {{ fullName }}'s sentence is 12 months or over",
        href: '#isYouthSentenceOver12Months',
        errorId: 'noIsYouthSentenceOver12Months',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isYouthChargedWithSeriousOffence',
        text: 'Select whether {{ fullName }} is being recalled because of being charged with a serious offence',
        href: '#isYouthChargedWithSeriousOffence',
        errorId: 'noIsYouthChargedWithSeriousOffence',
        values: undefined,
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      isYouthChargedWithSeriousOffence: undefined,
      isYouthSentenceOver12Months: undefined,
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with invalid data FTR56', async () => {
    const req = mockReq({
      params: { recommendationId: '123' },
      originalUrl: 'some-url',
      body: {
        isYouthChargedWithSeriousOffence: '',
        isYouthSentenceOver12Months: '',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: {
          personOnProbation: { name: faker.person.fullName() },
          sentenceGroup: SentenceGroup.YOUTH_SDS,
        },
        urlInfo: { basePath },
        statuses: [],
        flags: {},
      },
    })
    const next = mockNext()

    await suitabilityForFixedTermRecallController.post(req, res, next)
    expect(updateRecommendation).not.toHaveBeenCalled()

    expect(req.session.errors).toEqual([
      {
        name: 'isYouthSentenceOver12Months',
        text: "Select whether {{ fullName }}'s sentence is 12 months or over",
        href: '#isYouthSentenceOver12Months',
        errorId: 'noIsYouthSentenceOver12Months',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isYouthChargedWithSeriousOffence',
        text: 'Select whether {{ fullName }} is being recalled because of being charged with a serious offence',
        href: '#isYouthChargedWithSeriousOffence',
        errorId: 'noIsYouthChargedWithSeriousOffence',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      isYouthSentenceOver12Months: '',
      isYouthChargedWithSeriousOffence: '',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
