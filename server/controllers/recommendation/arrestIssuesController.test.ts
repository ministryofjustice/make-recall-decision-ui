import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import arrestIssuesController from './arrestIssuesController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          hasArrestIssues: { selected: true, details: 'notes' },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await arrestIssuesController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'YES', details: 'notes' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'hasArrestIssues',
              href: '#hasArrestIssues',
              errorId: 'noArrestIssuesSelected',
              html: "Select whether there's anything the police should know",
            },
          ],
          hasArrestIssues: {
            text: "Select whether there's anything the police should know",
            href: '#hasArrestIssues',
            errorId: 'noArrestIssuesSelected',
          },
        },
        recommendation: {
          hasArrestIssues: null,
        },
        token: 'token1',
      },
    })

    await arrestIssuesController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'hasArrestIssues',
          href: '#hasArrestIssues',
          errorId: 'noArrestIssuesSelected',
          html: "Select whether there's anything the police should know",
        },
      ],
      hasArrestIssues: {
        text: "Select whether there's anything the police should know",
        href: '#hasArrestIssues',
        errorId: 'noArrestIssuesSelected',
      },
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        hasArrestIssues: 'YES',
        hasArrestIssuesDetailsYes: 'notes',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()

    await arrestIssuesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        hasArrestIssues: {
          details: 'notes',
          selected: true,
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-custody`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        hasArrestIssuesDetailsYes: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await arrestIssuesController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        name: 'hasArrestIssues',
        text: "Select whether there's anything the police should know",
        href: '#hasArrestIssues',
        values: undefined,
        errorId: 'noArrestIssuesSelected',
        invalidParts: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
