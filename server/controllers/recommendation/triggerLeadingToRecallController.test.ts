import triggerLeadingToRecallController from './triggerLeadingToRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { ppPaths } from '../../routes/paths/pp'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: RecommendationResponseGenerator.generate({ triggerLeadingToRecall: false }),
      },
    })
    const next = mockNext()
    triggerLeadingToRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'triggerLeadingToRecall' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/triggerLeadingToRecall')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const recommendation = RecommendationResponseGenerator.generate({ triggerLeadingToRecall: true })
    const res = mockRes({
      locals: {
        recommendation,
      },
    })

    triggerLeadingToRecallController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual(recommendation.triggerLeadingToRecall)
  })

  it('initial load with error data', async () => {
    const recommendation = RecommendationResponseGenerator.generate({ triggerLeadingToRecall: true })
    const res = mockRes({
      locals: {
        errors: { triggerLeadingToRecall: { text: 'val' } },
        recommendation,
      },
    })

    triggerLeadingToRecallController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('')
    expect(res.locals.inputDisplayValues.errors).toEqual({ triggerLeadingToRecall: { text: 'val' } })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({})

    const recommendationId = '123'
    const triggerLeadingToRecall = 'some value'
    const basePath = `/recommendations/${recommendationId}/`
    const req = mockReq({
      params: { recommendationId },
      body: { triggerLeadingToRecall },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await triggerLeadingToRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId,
      token: res.locals.user.token,
      valuesToSave: {
        triggerLeadingToRecall,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(
      303,
      `/recommendations/${recommendationId}/${ppPaths.taskListConsiderRecall}`
    )
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({})

    const recommendationId = '123'
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId },
      body: { triggerLeadingToRecall: '' },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/${recommendationId}/` },
      },
    })

    await triggerLeadingToRecallController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingTriggerLeadingToRecall',
        href: '#triggerLeadingToRecall',
        invalidParts: undefined,
        name: 'triggerLeadingToRecall',
        text: 'Explain what has made you consider recalling {{ fullName }}',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
  })
})
