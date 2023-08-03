import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import recallTypeController from './recallTypeController'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
        token: 'token1',
      },
    })
    const next = mockNext()
    await recallTypeController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'recallType' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/recallType')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: { value: 'STANDARD', details: 'some details' },
            allOptions: [
              { value: 'STANDARD', text: 'Standard recall' },
              { value: 'FIXED_TERM', text: 'Fixed term recall' },
              { value: 'NO_RECALL', text: 'No recall' },
            ],
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await recallTypeController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'STANDARD', details: 'some details' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        unsavedValues: { recallType: 'STANDARD' },
        errors: {
          list: [
            {
              name: 'recallTypeDetailsStandard',
              href: '#recallTypeDetailsStandard',
              errorId: 'missingRecallTypeDetail',
              html: 'You must explain why you recommend this recall type',
            },
          ],
          recallTypeDetailsStandard: {
            text: 'You must explain why you recommend this recall type',
            href: '#recallTypeDetailsStandard',
            errorId: 'missingRecallTypeDetail',
          },
        },
        recommendation: {
          recallType: '',
        },
        token: 'token1',
      },
    })

    await recallTypeController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      recallTypeDetailsStandard: {
        errorId: 'missingRecallTypeDetail',
        href: '#recallTypeDetailsStandard',
        text: 'You must explain why you recommend this recall type',
      },
      list: [
        {
          href: '#recallTypeDetailsStandard',
          errorId: 'missingRecallTypeDetail',
          html: 'You must explain why you recommend this recall type',
          name: 'recallTypeDetailsStandard',
        },
      ],
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
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
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await recallTypeController.post(req, res, next)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.RECALL_DECIDED],
      deActivate: [STATUSES.NO_RECALL_DECIDED],
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        recallType: {
          selected: { value: 'STANDARD', details: 'some details' },
          allOptions: [
            { value: 'STANDARD', text: 'Standard recall' },
            { value: 'FIXED_TERM', text: 'Fixed term recall' },
            { value: 'NO_RECALL', text: 'No recall' },
          ],
        },
        isThisAnEmergencyRecall: null,
      },
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecallType',
      'Dave',
      {
        crn: 'X098092',
        recallType: 'STANDARD',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
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
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await recallTypeController.post(req, res, next)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.NO_RECALL_DECIDED],
      deActivate: [STATUSES.RECALL_DECIDED],
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        recallType: {
          selected: { value: 'NO_RECALL' },
          allOptions: [
            { value: 'STANDARD', text: 'Standard recall' },
            { value: 'FIXED_TERM', text: 'Fixed term recall' },
            { value: 'NO_RECALL', text: 'No recall' },
          ],
        },
        isThisAnEmergencyRecall: null,
      },
      featureFlags: {},
    })

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
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await recallTypeController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingRecallTypeDetail',
        href: '#recallTypeDetailsFixedTerm',
        text: 'You must explain why you recommend this recall type',
        name: 'recallTypeDetailsFixedTerm',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
