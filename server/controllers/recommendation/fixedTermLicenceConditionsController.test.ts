import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import fixedTermLicenceConditionsController from './fixedTermLicenceConditionsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          fixedTermAdditionalLicenceConditions: null,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await fixedTermLicenceConditionsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'fixedTermLicenceConditions' })
    expect(res.locals.inputDisplayValues).toStrictEqual({ details: undefined, value: undefined })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/fixedTermLicenceConditions')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          fixedTermAdditionalLicenceConditions: { selected: true, details: 'test' },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await fixedTermLicenceConditionsController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ details: 'test', value: 'YES' })
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

    await fixedTermLicenceConditionsController.get(mockReq(), res, mockNext())

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
        hasFixedTermLicenceConditions: 'YES',
        hasFixedTermLicenceConditionsDetails: 'test',
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

    await fixedTermLicenceConditionsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        fixedTermAdditionalLicenceConditions: {
          details: 'test',
          selected: true,
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
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await fixedTermLicenceConditionsController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noFixedTermLicenceConditionsSelected',
        href: '#hasFixedTermLicenceConditions',
        text: 'Select whether there are additional licence conditions',
        name: 'hasFixedTermLicenceConditions',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
