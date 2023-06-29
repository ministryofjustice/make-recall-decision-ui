import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import indeterminateDetailsController from './indeterminateDetailsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          indeterminateOrExtendedSentenceDetails: null,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await indeterminateDetailsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'indeterminateOrExtendedSentenceDetails' })
    expect(res.locals.inputDisplayValues).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/indeterminateOrExtendedSentenceDetails')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          indeterminateOrExtendedSentenceDetails: {
            selected: [{ value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE', details: 'test' }],
            allOptions: [
              {
                value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
                text: '{{ fullName }} has shown behaviour similar to the index offence',
              },
              {
                value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
                text: '{{ fullName }} has shown behaviour that could lead to a sexual or violent offence',
              },
              { value: 'OUT_OF_TOUCH', text: '{{ fullName }} is out of touch' },
            ],
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await indeterminateDetailsController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual([{ value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE', details: 'test' }])
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'indeterminateOrExtendedSentenceDetails',
              href: '#indeterminateOrExtendedSentenceDetails',
              errorId: 'noIndeterminateDetailsSelected',
              html: 'Select at least one of the criteria',
            },
          ],
          indeterminateOrExtendedSentenceDetails: {
            text: 'Select at least one of the criteria',
            href: '#indeterminateOrExtendedSentenceDetails',
            errorId: 'noIndeterminateDetailsSelected',
          },
        },
        recommendation: {
          indeterminateOrExtendedSentenceDetails: [{}],
        },
        token: 'token1',
      },
    })

    await indeterminateDetailsController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'indeterminateOrExtendedSentenceDetails',
          href: '#indeterminateOrExtendedSentenceDetails',
          errorId: 'noIndeterminateDetailsSelected',
          html: 'Select at least one of the criteria',
        },
      ],
      indeterminateOrExtendedSentenceDetails: {
        text: 'Select at least one of the criteria',
        href: '#indeterminateOrExtendedSentenceDetails',
        errorId: 'noIndeterminateDetailsSelected',
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
        indeterminateOrExtendedSentenceDetails: [
          'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
          'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
        ],
        'indeterminateOrExtendedSentenceDetailsDetail-BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE': 'test',
        'indeterminateOrExtendedSentenceDetailsDetail-BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE': 'test2',
        'indeterminateOrExtendedSentenceDetailsDetail-OUT_OF_TOUCH': '',
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

    await indeterminateDetailsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        indeterminateOrExtendedSentenceDetails: {
          selected: [
            { value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE', details: 'test' },
            { value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE', details: 'test2' },
          ],
          allOptions: [
            {
              value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
              text: '{{ fullName }} has shown behaviour similar to the index offence',
            },
            {
              value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
              text: '{{ fullName }} has shown behaviour that could lead to a sexual or violent offence',
            },
            { value: 'OUT_OF_TOUCH', text: '{{ fullName }} is out of touch' },
          ],
        },
      },
      token: 'token1',
      featureFlags: {},
    })

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

    await indeterminateDetailsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noIndeterminateDetailsSelected',
        href: '#indeterminateOrExtendedSentenceDetails',
        text: 'Select at least one of the criteria',
        name: 'indeterminateOrExtendedSentenceDetails',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
