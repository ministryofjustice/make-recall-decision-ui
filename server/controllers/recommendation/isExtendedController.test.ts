import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import isExtendedSentenceController from './isExtendedController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
        token: 'token1',
        flags: {},
      },
    })
    const next = mockNext()
    await isExtendedSentenceController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'isExtendedSentence' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/isExtendedSentence')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isExtendedSentence: true,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await isExtendedSentenceController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ value: 'YES' })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'isExtendedSentence',
              text: 'Select whether {{ fullName }} is on an extended sentence or not',
              href: '#isExtendedSentence',
              errorId: 'noIsExtendedSelected',
            },
          ],
          isExtendedSentence: {
            text: 'Select whether {{ fullName }} is on an extended sentence or not',
            href: '#isExtendedSentence',
            errorId: 'noIsExtendedSelected',
          },
        },
        recommendation: {
          isExtendedSentence: '',
        },
        token: 'token1',
      },
    })

    await isExtendedSentenceController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      isExtendedSentence: {
        errorId: 'noIsExtendedSelected',
        href: '#isExtendedSentence',
        text: 'Select whether {{ fullName }} is on an extended sentence or not',
      },
      list: [
        {
          href: '#isExtendedSentence',
          errorId: 'noIsExtendedSelected',
          text: 'Select whether {{ fullName }} is on an extended sentence or not',
          name: 'isExtendedSentence',
        },
      ],
    })
  })
})

describe('post', () => {
  it('post with valid data, given prior indeterminateSentence set to false', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        currentSavedValue: 'NO',
        isExtendedSentence: 'YES',
        isIndeterminateSentence: '0',
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

    await isExtendedSentenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        indeterminateOrExtendedSentenceDetails: null,
        indeterminateSentenceType: null,
        isExtendedSentence: true,
        recallType: null,
        isThisAnEmergencyRecall: null,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-consider-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with non extended, given prior indeterminateSentence set to true', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        currentSavedValue: 'YES',
        isExtendedSentence: 'NO',
        isIndeterminateSentence: '1',
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

    await isExtendedSentenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        isExtendedSentence: false,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/indeterminate-type`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with extended, given prior indeterminateSentence set to false', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        currentSavedValue: 'NO',
        isExtendedSentence: 'YES',
        isIndeterminateSentence: '0',
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

    await isExtendedSentenceController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        indeterminateOrExtendedSentenceDetails: null,
        indeterminateSentenceType: null,
        isExtendedSentence: true,
        recallType: null,
        isThisAnEmergencyRecall: null,
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
      body: {
        crn: 'X098092',
        isExtendedSentence: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await isExtendedSentenceController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noIsExtendedSelected',
        href: '#isExtendedSentence',
        text: 'Select whether {{ fullName }} is on an extended sentence or not',
        name: 'isExtendedSentence',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
