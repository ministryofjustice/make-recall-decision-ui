import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import whatLedController from './whatLedController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    whatLedController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'whatLedToRecall' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/whatLedToRecall')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { whatLedToRecall: 'lorem ipsum' },
      },
    })

    whatLedController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('lorem ipsum')
  })

  it('initial load with error data', async () => {
    const errors = {
      list: [
        {
          name: 'whatLedToRecall',
          href: '#whatLedToRecall',
          errorId: 'missingWhatLedToRecall',
          html: 'Enter details of what has led to this recall',
        },
      ],
      whatLedToRecall: {
        text: 'Enter details of what has led to this recall',
        href: '#whatLedToRecall',
        errorId: 'missingWhatLedToRecall',
      },
    }

    const res = mockRes({
      locals: {
        errors,
        recommendation: { whatLedToRecall: '' },
      },
    })

    whatLedController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('')
    expect(res.locals.errors).toEqual(errors)
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: { whatLedToRecall: 'some data' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await whatLedController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        whatLedToRecall: 'some data',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/task-list#heading-circumstances')
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { whatLedToRecall: '' },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await whatLedController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingWhatLedToRecall',
        href: '#whatLedToRecall',
        invalidParts: undefined,
        name: 'whatLedToRecall',
        text: 'Enter details of what has led to this recall',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
