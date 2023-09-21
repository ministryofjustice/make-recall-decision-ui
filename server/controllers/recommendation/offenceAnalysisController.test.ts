import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import offenceAnalysisController from './offenceAnalysisController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({ offenceAnalysis: 'test 123' })
    const res = mockRes()
    const next = mockNext()
    await offenceAnalysisController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'indexOffenceDetails',
      recommendationId: '123',
      token: 'token',
    })

    expect(res.locals.recommendation).toEqual({ offenceAnalysis: 'test 123' })
    expect(res.locals.page.id).toEqual('offenceAnalysis')
  })

  it('initial load with error data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({ offenceAnalysis: 'test 123' })
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'offenceAnalysis',
              href: '#offenceAnalysis',
              errorId: 'missingOffenceAnalysis',
              html: 'Enter the offence analysis',
            },
          ],
          offenceAnalysis: {
            text: 'Enter the offence analysis',
            href: '#offenceAnalysis',
            errorId: 'missingOffenceAnalysis',
          },
        },
        recommendation: {
          hasArrestIssues: null,
        },
        token: 'token1',
      },
    })

    await offenceAnalysisController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'offenceAnalysis',
          href: '#offenceAnalysis',
          errorId: 'missingOffenceAnalysis',
          html: 'Enter the offence analysis',
        },
      ],
      offenceAnalysis: {
        text: 'Enter the offence analysis',
        href: '#offenceAnalysis',
        errorId: 'missingOffenceAnalysis',
      },
    })
  })
})

describe('post', () => {
  it('post', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        offenceAnalysis: 'test test ',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()

    await offenceAnalysisController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        offenceAnalysis: 'test test ',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-person-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        offenceAnalysis: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await offenceAnalysisController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        name: 'offenceAnalysis',
        text: 'Enter the offence analysis',
        href: '#offenceAnalysis',
        values: undefined,
        errorId: 'missingOffenceAnalysis',
        invalidParts: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
