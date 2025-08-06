import { faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import recallTypeController from './recallTypeController'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { inputDisplayValuesRecallType } from '../recommendations/recallType/inputDisplayValues'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { validateRecallType } from '../recommendations/recallType/formValidator'
import { formOptions } from '../recommendations/formOptions/formOptions'
import { EVENTS } from '../../utils/constants'
import { availableRecallTypes } from '../recommendations/recallType/availableRecallTypes'
import { generateBooleanCombinations } from '../../testUtils/booleanUtils'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/recallType/availableRecallTypes')
jest.mock('../recommendations/recallType/inputDisplayValues')
jest.mock('../recommendations/recallType/formValidator')

function testGet(
  locals: Record<string, unknown>,
  inputDisplayValues: {
    value: string
    details: string
  },
  next: jest.Mock
) {
  const res = mockRes({ locals })
  const flagFtr48Updates = (locals.flags as Record<string, boolean>)?.flagFtr48Updates ?? false

  const expectedAvailableRecallTypes = faker.helpers.arrayElements(formOptions.recallType)
  beforeEach(async () => {
    ;(availableRecallTypes as jest.Mock).mockReturnValueOnce(expectedAvailableRecallTypes)
    ;(inputDisplayValuesRecallType as jest.Mock).mockReturnValueOnce(inputDisplayValues)
    recallTypeController.get(mockReq(), res, next)
  })

  it('adds correct page to res.locals', async () => {
    expect(res.locals.page).toEqual({ id: 'recallType' })
  })
  it('adds result of inputDisplayValuesRecallType to res.locals', async () => {
    expect(res.locals.inputDisplayValues).toEqual(inputDisplayValues)
    expect(inputDisplayValuesRecallType).toHaveBeenCalledWith({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: res.locals.recommendation,
    })
  })
  it('adds result of availableRecallTypes to res.locals', async () => {
    expect(res.locals.availableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })
  it('adds FTR48 flag to res.locals', async () => {
    expect(res.locals.ftr48Enabled).toEqual(flagFtr48Updates)
  })
  it('adds FTR48 Mandatory to res.locals', async () => {
    if (flagFtr48Updates) {
      expect(res.locals.ftrMandatory).toBeTruthy()
    } else {
      expect(res.locals.ftrMandatory).toBeFalsy()
    }
  })
  it('renders the recallType page and calls next', async () => {
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/recallType')
    expect(next).toHaveBeenCalled()
  })
}

describe('get', () => {
  const locals = {
    token: 'token1',
    recommendation: RecommendationResponseGenerator.generate({
      isSentence48MonthsOrOver: false,
      isUnder18: false,
      isMappaCategory4: false,
      isMappaLevel2Or3: false,
      isRecalledOnNewChargedOffence: false,
      isServingFTSentenceForTerroristOffence: false,
      hasBeenChargedWithTerroristOrStateThreatOffence: false,
    }),
    unsavedValues: { recallType: 'STANDARD' },
    errors: {
      list: [
        {
          name: 'recallTypeDetailsStandard',
          href: '#recallTypeDetailsStandard',
          errorId: 'missingRecallTypeDetail',
          html: 'Explain why you recommend this recall type',
        },
      ],
      recallTypeDetailsStandard: {
        text: 'Explain why you recommend this recall type',
        href: '#recallTypeDetailsStandard',
        errorId: 'missingRecallTypeDetail',
      },
    },
  }
  const next = mockNext()

  const inputDisplayValues = { value: faker.string.alpha(), details: faker.lorem.text() }

  describe('with no FTR48 flag set', () => {
    testGet(locals, inputDisplayValues, next)
  })

  describe('with FTR48 flag set', () => {
    const localsWithFTR48FlagSet = {
      ...locals,
      flags: { flagFtr48Updates: faker.datatype.boolean() },
    }

    testGet(localsWithFTR48FlagSet, inputDisplayValues, next)

    describe('and the Person on Probation meets any exclusion criteria', () => {
      describe('then FTR is not mandatory', () => {
        const booleanCombinations = generateBooleanCombinations(7).filter(c => !c.every(b => !b))
        booleanCombinations.forEach(testCase => {
          const prefix = 'Exclusion criteria: '
          let testCaseOptions = {
            isSentence48MonthsOrOver: false,
            isUnder18: false,
            isMappaCategory4: false,
            isMappaLevel2Or3: false,
            isRecalledOnNewChargedOffence: false,
            isServingFTSentenceForTerroristOffence: false,
            hasBeenChargedWithTerroristOrStateThreatOffence: false,
          }
          let title = prefix

          if (testCase[0]) {
            testCaseOptions = {
              ...testCaseOptions,
              isSentence48MonthsOrOver: true,
            }
            title += `${title !== prefix ? ',' : ''} Sentence 48 months or over`
          }
          if (testCase[1]) {
            testCaseOptions = {
              ...testCaseOptions,
              isUnder18: true,
            }
            title += `${title !== prefix ? ',' : ''} Is under 18`
          }
          if (testCase[2]) {
            testCaseOptions = {
              ...testCaseOptions,
              isMappaCategory4: true,
            }
            title += `${title !== prefix ? ',' : ''} Mappa cat. 4`
          }
          if (testCase[3]) {
            testCaseOptions = {
              ...testCaseOptions,
              isMappaLevel2Or3: true,
            }
            title += `${title !== prefix ? ',' : ''} Mappa cat. 2/3`
          }
          if (testCase[4]) {
            testCaseOptions = {
              ...testCaseOptions,
              isRecalledOnNewChargedOffence: true,
            }
            title += `${title !== prefix ? ',' : ''} Recalled on new charge`
          }
          if (testCase[5]) {
            testCaseOptions = {
              ...testCaseOptions,
              isServingFTSentenceForTerroristOffence: true,
            }
            title += `${title !== prefix ? ',' : ''} Serving terrorist offence`
          }
          if (testCase[6]) {
            testCaseOptions = {
              ...testCaseOptions,
              hasBeenChargedWithTerroristOrStateThreatOffence: true,
            }
            title += `${title !== prefix ? ',' : ''} Charged with terrorist offence`
          }

          it(title, async () => {
            const recommendationWithExceptionCriteria = RecommendationResponseGenerator.generate({ ...testCaseOptions })
            const exceptionCriteriaRes = mockRes({
              locals: { ...localsWithFTR48FlagSet, recommendation: recommendationWithExceptionCriteria },
            })

            recallTypeController.get(mockReq(), exceptionCriteriaRes, next)

            expect(exceptionCriteriaRes.locals.ftrMandatory).toBeFalsy()
          })
        })
      })
    })
  })
})

describe('post', () => {
  it('post with valid data - recall', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        recallType: 'STANDARD',
        recallTypeDetailsStandard: 'some details',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1', username: 'Dave', region: { code: 'N07', name: 'London' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    const validationResults = {
      valuesToSave: {
        recallType: {
          selected: {
            value: req.body.recallType,
            details: req.body.recallTypeDetailsStandard,
          },
          allOptions: formOptions.recallType,
        },
        isThisAnEmergencyRecall: false,
      },
      monitoringEvent: {
        eventName: EVENTS.MRD_RECALL_TYPE,
        data: {
          recallType: req.body.recallType,
        },
      },
    }
    ;(validateRecallType as jest.Mock).mockResolvedValue(validationResults)

    await recallTypeController.post(req, res, next)

    expect(validateRecallType).toHaveBeenCalledWith({
      requestBody: req.body,
      recommendationId: req.params.recommendationId,
      urlInfo: res.locals.urlInfo,
      token: res.locals.user.token,
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: req.params.recommendationId,
      token: res.locals.user.token,
      activate: [STATUSES.RECALL_DECIDED],
      deActivate: [STATUSES.NO_RECALL_DECIDED],
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: req.params.recommendationId,
      token: res.locals.user.token,
      valuesToSave: validationResults.valuesToSave,
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      validationResults.monitoringEvent.eventName,
      res.locals.user.username,
      {
        crn: req.body.crn,
        recallType: validationResults.monitoringEvent.data.recallType,
        recommendationId: req.params.recommendationId,
        region: { code: res.locals.user.region.code, name: res.locals.user.region.name },
      },
      {}
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/emergency-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with valid data - no recall', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        recallType: 'NO_RECALL',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1', username: 'Dave', region: { code: 'N07', name: 'London' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    const validationResults = {
      valuesToSave: {
        recallType: {
          selected: {
            value: req.body.recallType,
            details: req.body.recallTypeDetailsStandard,
          },
          allOptions: formOptions.recallType,
        },
        isThisAnEmergencyRecall: false,
      },
      monitoringEvent: {
        eventName: EVENTS.MRD_RECALL_TYPE,
        data: {
          recallType: req.body.recallType,
        },
      },
    }
    ;(validateRecallType as jest.Mock).mockResolvedValue(validationResults)

    await recallTypeController.post(req, res, next)

    expect(validateRecallType).toHaveBeenCalledWith({
      requestBody: req.body,
      recommendationId: req.params.recommendationId,
      urlInfo: res.locals.urlInfo,
      token: res.locals.user.token,
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: req.params.recommendationId,
      token: res.locals.user.token,
      activate: [STATUSES.NO_RECALL_DECIDED],
      deActivate: [STATUSES.RECALL_DECIDED],
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: req.params.recommendationId,
      token: res.locals.user.token,
      valuesToSave: validationResults.valuesToSave,
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      validationResults.monitoringEvent.eventName,
      res.locals.user.username,
      {
        crn: req.body.crn,
        recallType: validationResults.monitoringEvent.data.recallType,
        recommendationId: req.params.recommendationId,
        region: { code: res.locals.user.region.code, name: res.locals.user.region.name },
      },
      {}
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-no-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const validationResults = {
      errors: [
        {
          errorId: 'missingRecallTypeDetail',
          href: '#recallTypeDetailsFixedTerm',
          text: 'Explain why you recommend this recall type',
          name: 'recallTypeDetailsFixedTerm',
        },
      ],
      unsavedValues: faker.lorem.word(),
    }
    ;(validateRecallType as jest.Mock).mockResolvedValue(validationResults)

    await recallTypeController.post(req, res, mockNext())

    expect(validateRecallType).toHaveBeenCalledWith({
      requestBody: req.body,
      recommendationId: req.params.recommendationId,
      urlInfo: res.locals.urlInfo,
      token: res.locals.user.token,
    })

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session).toEqual({
      errors: validationResults.errors,
      unsavedValues: validationResults.unsavedValues,
    })
    expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
  })
})
