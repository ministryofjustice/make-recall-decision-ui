import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import isIndeterminateSentenceController from './isIndeterminateController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: true,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await isIndeterminateSentenceController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'YES' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'isIndeterminateSentence',
              text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
              href: '#isIndeterminateSentence',
              errorId: 'noIsIndeterminateSelected',
            },
          ],
          isIndeterminateSentence: {
            text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
            href: '#isIndeterminateSentence',
            errorId: 'noIsIndeterminateSelected',
          },
        },
        recommendation: {
          isIndeterminateSentence: '',
        },
        token: 'token1',
      },
    })

    await isIndeterminateSentenceController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      isIndeterminateSentence: {
        errorId: 'noIsIndeterminateSelected',
        href: '#isIndeterminateSentence',
        text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
      },
      list: [
        {
          href: '#isIndeterminateSentence',
          errorId: 'noIsIndeterminateSelected',
          text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
          name: 'isIndeterminateSentence',
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
        isIndeterminateSentence: 'YES',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { fromPageId: 'task-list-consider-recall', basePath },
      },
    })
    const next = mockNext()

    await isIndeterminateSentenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        isIndeterminateSentence: true,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/is-extended`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        isIndeterminateSentence: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await isIndeterminateSentenceController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noIsIndeterminateSelected',
        href: '#isIndeterminateSentence',
        text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
        name: 'isIndeterminateSentence',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
