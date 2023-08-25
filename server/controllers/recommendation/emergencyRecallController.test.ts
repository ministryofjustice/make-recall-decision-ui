import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import emergencyRecallController from './emergencyRecallController'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        token: 'token1',
      },
    })
    const next = mockNext()
    await emergencyRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'emergencyRecall' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/emergencyRecall')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isThisAnEmergencyRecall: false,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await emergencyRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'NO' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'isThisAnEmergencyRecall',
              href: '#isThisAnEmergencyRecall',
              errorId: 'noEmergencyRecallSelected',
              html: 'You must select whether this is an emergency recall or not',
            },
          ],
          isThisAnEmergencyRecall: {
            text: 'You must select whether this is an emergency recall or not',
            href: '#isThisAnEmergencyRecall',
            errorId: 'noEmergencyRecallSelected',
          },
        },
        recommendation: {
          isThisAnEmergencyRecall: undefined,
        },
        token: 'token1',
      },
    })

    await emergencyRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'isThisAnEmergencyRecall',
          href: '#isThisAnEmergencyRecall',
          errorId: 'noEmergencyRecallSelected',
          html: 'You must select whether this is an emergency recall or not',
        },
      ],
      isThisAnEmergencyRecall: {
        text: 'You must select whether this is an emergency recall or not',
        href: '#isThisAnEmergencyRecall',
        errorId: 'noEmergencyRecallSelected',
      },
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
        isThisAnEmergencyRecall: 'YES',
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

    await emergencyRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        isThisAnEmergencyRecall: true,
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecallType',
      'Dave',
      {
        crn: 'X098092',
        recallType: 'EMERGENCY_DETERMINATE',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/sensitive-info`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        recallType: 'STANDARD',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await emergencyRecallController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noEmergencyRecallSelected',
        href: '#isThisAnEmergencyRecall',
        text: 'You must select whether this is an emergency recall or not',
        name: 'isThisAnEmergencyRecall',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
