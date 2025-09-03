import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import suitabilityForFixedTermRecallController from './suitabilityForFixedTermRecallController'
import { getCaseSection } from '../caseSummary/getCaseSection'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { nextPagePreservingFromPageAndAnchor } from '../recommendations/helpers/urls'
import {
  isFixedTermRecallMandatoryForValueKeys,
  isFixedTermRecallMandatoryForRecommendation,
} from '../../utils/fixedTermRecallUtils'

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
  const fields = [
    'isUnder18',
    'isSentence48MonthsOrOver',
    'isMappaCategory4',
    'isMappaLevel2Or3',
    'isRecalledOnNewChargedOffence',
    'isServingFTSentenceForTerroristOffence',
    'hasBeenChargedWithTerroristOrStateThreatOffence',
  ]

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
    fields.forEach(fieldId => {
      expect(res.locals.inputDisplayValues[fieldId].value).not.toBeDefined()
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall')
    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
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
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
    expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('YES')
    fields.forEach(fieldId => {
      expect(res.locals.inputDisplayValues[fieldId].value).toEqual('YES')
    })
  })

  it('load with existing data inverted', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isSentence48MonthsOrOver: true,
          isUnder18: false,
          isMappaCategory4: false,
          isMappaLevel2Or3: true,
          isRecalledOnNewChargedOffence: false,
          isServingFTSentenceForTerroristOffence: true,
          hasBeenChargedWithTerroristOrStateThreatOffence: false,
          personOnProbation: {
            name: faker.person.fullName(),
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
    expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('NO')
    expect(res.locals.inputDisplayValues.isSentence48MonthsOrOver.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaCategory4.value).toEqual('NO')
    expect(res.locals.inputDisplayValues.isMappaLevel2Or3.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isRecalledOnNewChargedOffence.value).toEqual('NO')
    expect(res.locals.inputDisplayValues.isServingFTSentenceForTerroristOffence.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.hasBeenChargedWithTerroristOrStateThreatOffence.value).toEqual('NO')
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

    expect(res.locals.inputDisplayValues.isSentence48MonthsOrOver.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isUnder18.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaCategory4.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaLevel2Or3.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isRecalledOnNewChargedOffence.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.isServingFTSentenceForTerroristOffence.value).toEqual('YES')
    expect(res.locals.inputDisplayValues.hasBeenChargedWithTerroristOrStateThreatOffence.value).toEqual('YES')
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
          isExtendedSentence: '',
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

  describe('When the existing recommendation is fixed term recall mandatory', () => {
    beforeEach(() => {
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValue(true)
    })
    it('The warning panel properties are undefined', async () => {
      const recommendationWithSelectedRecallType = RecommendationResponseGenerator.generate({
        recallType: 'none',
        personOnProbation: true,
      })
      const res = mockRes({
        locals: {
          recommendation: recommendationWithSelectedRecallType,
        },
      })

      await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

      expect(res.locals.page.warningPanel).toBeUndefined()
    })
  })
  describe('When the existing recommendation is fixed term recall discretionary', () => {
    beforeEach(() => {
      ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValueOnce(false)
    })
    it('The warning panel properties are added to the page data', async () => {
      const recommendationWithSelectedRecallType = RecommendationResponseGenerator.generate({
        recallType: 'any',
        personOnProbation: true,
      })
      const res = mockRes({
        locals: {
          recommendation: recommendationWithSelectedRecallType,
        },
      })

      await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

      expect(res.locals.page.warningPanel).toBeDefined()
      expect(res.locals.page.warningPanel).toEqual({
        title: 'Changes could affect your recall recommendation choices',
        body: `Changing your answers could make ${recommendationWithSelectedRecallType.personOnProbation.name} eligible for a mandatory fixed term recall. If this happens, information explaining your previous recall type selection will be deleted.`,
      })
    })
  })
})

describe('post', () => {
  const expectedResolvedRedirectUrl = faker.internet.url()
  beforeEach(() => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(nextPagePreservingFromPageAndAnchor as jest.Mock).mockReturnValue(expectedResolvedRedirectUrl)
  })
  const basePath = `/recommendations/123/`
  describe('post with valid data', () => {
    const testCases: {
      name: string
      previouslyMandatory: boolean
      updatedMandatory: boolean
      detailsExpected: boolean
    }[] = [
      {
        name: 'previously discretionary - now discrestionary - details not updated',
        previouslyMandatory: false,
        updatedMandatory: false,
        detailsExpected: false,
      },
      {
        name: 'previously discretionary - now mandatory - details not updated',
        previouslyMandatory: false,
        updatedMandatory: true,
        detailsExpected: false,
      },
      {
        name: 'previously mandatory - now mandatory - details not updated',
        previouslyMandatory: true,
        updatedMandatory: true,
        detailsExpected: false,
      },
      {
        name: 'previously mandatory - now discretionary - details updated to clear value',
        previouslyMandatory: true,
        updatedMandatory: false,
        detailsExpected: true,
      },
    ]
    testCases.forEach(({ name, previouslyMandatory, updatedMandatory, detailsExpected }) => {
      it(name, async () => {
        ;(isFixedTermRecallMandatoryForRecommendation as jest.Mock).mockReturnValue(previouslyMandatory)
        ;(isFixedTermRecallMandatoryForValueKeys as jest.Mock).mockReturnValue(updatedMandatory)
        const req = mockReq({
          params: { recommendationId: '123' },
          body: {
            isUnder18: 'YES',
            isSentence48MonthsOrOver: 'YES',
            isMappaCategory4: 'YES',
            isMappaLevel2Or3: 'YES',
            isRecalledOnNewChargedOffence: 'YES',
            isServingFTSentenceForTerroristOffence: 'YES',
            hasBeenChargedWithTerroristOrStateThreatOffence: 'YES',
          },
        })
        const priorRecommendation = RecommendationResponseGenerator.generate({
          recallType: 'any',
          personOnProbation: true,
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
            isUnder18: true,
            isSentence48MonthsOrOver: true,
            isMappaCategory4: true,
            isMappaLevel2Or3: true,
            isRecalledOnNewChargedOffence: true,
            isServingFTSentenceForTerroristOffence: true,
            hasBeenChargedWithTerroristOrStateThreatOffence: true,
            ...(detailsExpected
              ? {
                  recallType: {
                    selected: { value: priorRecommendation.recallType.selected.value },
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
        name: 'isSentence48MonthsOrOver',
        text: "Select whether {{ fullName }}'s sentence is 48 months or over",
        href: '#isSentence48MonthsOrOver',
        errorId: 'noIsSentence48MonthsOrOver',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isUnder18',
        text: 'Select whether {{ fullName }} is under 18',
        href: '#isUnder18',
        errorId: 'noIsUnder18',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isMappaCategory4',
        text: 'Select whether {{ fullName }} is in MAPPA category 4',
        href: '#isMappaCategory4',
        errorId: 'noIsMappaCategory4',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isMappaLevel2Or3',
        text: "Select whether {{ fullName }}'s MAPPA level is 2 or 3",
        href: '#isMappaLevel2Or3',
        errorId: 'noIsMappaLevel2Or3',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isRecalledOnNewChargedOffence',
        text: 'Select whether {{ fullName }} is being recalled on a new charged offence',
        href: '#isRecalledOnNewChargedOffence',
        errorId: 'noIsRecalledOnNewChargedOffence',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isServingFTSentenceForTerroristOffence',
        text: 'Select whether {{ fullName }} is serving a fixed term sentence for a terrorist offence',
        href: '#isServingFTSentenceForTerroristOffence',
        errorId: 'noIsServingFTSentenceForTerroristOffence',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'hasBeenChargedWithTerroristOrStateThreatOffence',
        text: 'Select whether {{ fullName }} has been charged with a terrorist or state threat offence',
        href: '#hasBeenChargedWithTerroristOrStateThreatOffence',
        errorId: 'noHasBeenChargedWithTerroristOrStateThreatOffence',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      isUnder18: '',
      isSentence48MonthsOrOver: '',
      isMappaCategory4: '',
      isMappaLevel2Or3: '',
      isRecalledOnNewChargedOffence: '',
      isServingFTSentenceForTerroristOffence: '',
      hasBeenChargedWithTerroristOrStateThreatOffence: '',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
