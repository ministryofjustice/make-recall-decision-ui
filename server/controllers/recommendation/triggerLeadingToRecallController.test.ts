import triggerLeadingToRecallController from './triggerLeadingToRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
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
    const res = mockRes({
      locals: {
        recommendation: { triggerLeadingToRecall: 'lorem ipsum' },
      },
    })

    triggerLeadingToRecallController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('lorem ipsum')
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: { triggerLeadingToRecall: { text: 'val' } },
        recommendation: { triggerLeadingToRecall: 'lorem ipsum' },
      },
    })

    triggerLeadingToRecallController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('')
    expect(res.locals.inputDisplayValues.errors).toEqual({ triggerLeadingToRecall: { text: 'val' } })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: { triggerLeadingToRecall: 'some value' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await triggerLeadingToRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        triggerLeadingToRecall: 'some value',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-consider-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { triggerLeadingToRecall: '' },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
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
        text: 'You must explain what has made you think about recalling {{ fullName }}',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
