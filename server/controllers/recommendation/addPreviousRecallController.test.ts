import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import addPreviousRecallController from './addPreviousRecallController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
        token: 'token1',
      },
    })
    const next = mockNext()
    await addPreviousRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: undefined })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'previousRecallDate',
              href: '#previousRecallDate-day',
              values: [Object],
              errorId: 'blankDateTime',
              html: 'Enter the previous recall date',
            },
          ],
          previousRecallDate: {
            text: 'Enter the previous recall date',
            href: '#previousRecallDate-day',
            values: { day: '', month: '', year: '' },
            errorId: 'blankDateTime',
          },
        },
        recommendation: {
          hasArrestIssues: null,
        },
        token: 'token1',
      },
    })

    await addPreviousRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'previousRecallDate',
          href: '#previousRecallDate-day',
          values: [Object],
          errorId: 'blankDateTime',
          html: 'Enter the previous recall date',
        },
      ],
      previousRecallDate: {
        text: 'Enter the previous recall date',
        href: '#previousRecallDate-day',
        values: { day: '', month: '', year: '' },
        errorId: 'blankDateTime',
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
        previousRecallDates: '2001-01-01|',
        'previousRecallDate-day': '01',
        'previousRecallDate-month': '01',
        'previousRecallDate-year': '2002',
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

    await addPreviousRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        previousRecalls: {
          previousRecallDates: ['2001-01-01', '2002-01-01'],
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/previous-recalls`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        previousRecallDates: '2001-01-01|',
        'previousRecallDate-day': '',
        'previousRecallDate-month': '',
        'previousRecallDate-year': '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await addPreviousRecallController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        name: 'previousRecallDate',
        text: 'Enter the previous recall date',
        href: '#previousRecallDate-day',
        values: {
          day: '',
          month: '',
          year: '',
        },
        errorId: 'blankDateTime',
        invalidParts: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
