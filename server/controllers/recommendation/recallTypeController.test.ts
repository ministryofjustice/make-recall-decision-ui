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

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/recallType/inputDisplayValues')
jest.mock('../recommendations/recallType/formValidator')

function testGet(
  // not sure how to define the type for locals without any, but ESLint complains if I keep any...
  locals: object, // Record<string, any> & Locals,
  inputDisplayValues: {
    value: string
    details: string
  },
  expectedAvailableRecallTypes: { value: string; text: string }[],
  next: jest.Mock
) {
  // @ts-expect-error ignoring until I figure out how to define locals
  const res = mockRes({ locals })
  beforeEach(async () => {
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
  it('adds available recall types to res.locals', async () => {
    expect(res.locals.availableRecallTypes).toEqual(expectedAvailableRecallTypes)
  })
  it('adds FTR48 flag to res.locals', async () => {
    // @ts-expect-error ignoring until I figure out how to define locals
    expect(res.locals.ftr48Enabled).toEqual(locals.flags.ftr48Enabled)
  })
  it('renders the recallType page and calls next', async () => {
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/recallType')
    expect(next).toHaveBeenCalled()
  })
}

describe('get', () => {
  const locals = {
    token: 'token1',
    recommendation: RecommendationResponseGenerator.generate(),
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
  describe('with FTR48 flag disabled', () => {
    const localsWithDisabledFlag = {
      ...locals,
      flags: { ftr48Enabled: false },
    }

    const expectedAvailableRecallTypes = formOptions.recallType

    testGet(localsWithDisabledFlag, inputDisplayValues, expectedAvailableRecallTypes, next)
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
