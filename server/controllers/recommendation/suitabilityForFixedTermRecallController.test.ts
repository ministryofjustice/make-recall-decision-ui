import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import suitabilityForFixedTermRecallController from './suitabilityForFixedTermRecallController'
import { getCaseSection } from '../caseSummary/getCaseSection'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../caseSummary/getCaseSection')

describe('get', () => {
  it('load with no data', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: 'case summary data',
    })

    const res = mockRes({
      locals: {
        recommendation: {},
        token: 'token1',
        flags: {},
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'suitabilityForFixedTermRecall' })
    expect(res.locals.caseSummary).toEqual('case summary data')
    expect(res.locals.inputDisplayValues.isOver18).not.toBeDefined()
    expect(res.locals.inputDisplayValues.isSentenceUnder12Months).not.toBeDefined()
    expect(res.locals.inputDisplayValues.isMappaLevelAbove1).not.toBeDefined()
    expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: 'case summary data',
    })
    const res = mockRes({
      locals: {
        recommendation: {
          isOver18: true,
          isSentenceUnder12Months: true,
          isMappaLevelAbove1: true,
          hasBeenConvictedOfSeriousOffence: true,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues.isOver18).toEqual('YES')
    expect(res.locals.inputDisplayValues.isSentenceUnder12Months).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaLevelAbove1).toEqual('YES')
    expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence).toEqual('YES')
  })

  it('load with errors', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: 'case summary data',
    })
    const res = mockRes({
      locals: {
        unsavedValues: {
          isOver18: false,
          isSentenceUnder12Months: false,
          isMappaLevelAbove1: false,
          hasBeenConvictedOfSeriousOffence: false,
        },
        recommendation: {
          isOver18: true,
          isSentenceUnder12Months: true,
          isMappaLevelAbove1: true,
          hasBeenConvictedOfSeriousOffence: true,
        },
        token: 'token1',
        errors: {
          isOver18: {
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isOver18',
            errorId: 'noIsOver18',
          },
          list: [
            {
              name: 'isOver18',
              text: 'Select whether {{ fullName }} is 18 or over',
              href: '#isOver18',
              errorId: 'noIsOver18',
            },
          ],
        },
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues.errors).toEqual({
      isOver18: {
        text: 'Select whether {{ fullName }} is 18 or over',
        href: '#isOver18',
        errorId: 'noIsOver18',
      },
      list: [
        {
          name: 'isOver18',
          text: 'Select whether {{ fullName }} is 18 or over',
          href: '#isOver18',
          errorId: 'noIsOver18',
        },
      ],
    })
    expect(res.locals.inputDisplayValues.isOver18).toEqual('YES')
    expect(res.locals.inputDisplayValues.isSentenceUnder12Months).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaLevelAbove1).toEqual('YES')
    expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence).toEqual('YES')
  })

  it('initial load with error data', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: 'case summary data',
    })
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'isOver18',
              text: 'Select whether {{ fullName }} is 18 or over',
              href: '#isOver18',
              errorId: 'noIsOver18',
            },
          ],
          isOver18: {
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isOver18',
            errorId: 'noIsOver18',
          },
        },
        recommendation: {
          isExtendedSentence: '',
        },
        token: 'token1',
      },
    })

    await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      isOver18: {
        text: 'Select whether {{ fullName }} is 18 or over',
        href: '#isOver18',
        errorId: 'noIsOver18',
      },
      list: [
        {
          name: 'isOver18',
          text: 'Select whether {{ fullName }} is 18 or over',
          href: '#isOver18',
          errorId: 'noIsOver18',
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
        isOver18: 'YES',
        isSentenceUnder12Months: 'YES',
        isMappaLevelAbove1: 'YES',
        hasBeenConvictedOfSeriousOffence: 'YES',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
        statuses: [],
      },
    })
    const next = mockNext()

    await suitabilityForFixedTermRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        isOver18: true,
        isSentenceUnder12Months: true,
        isMappaLevelAbove1: true,
        hasBeenConvictedOfSeriousOffence: true,
      },
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
        isOver18: '',
        isSentenceUnder12Months: '',
        isMappaLevelAbove1: '',
        hasBeenConvictedOfSeriousOffence: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
        statuses: [],
      },
    })

    await suitabilityForFixedTermRecallController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        name: 'isOver18',
        text: 'Select whether {{ fullName }} is 18 or over',
        href: '#isOver18',
        errorId: 'noIsOver18',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isSentenceUnder12Months',
        text: 'Select whether the sentence is under 12 months',
        href: '#isSentenceUnder12Months',
        errorId: 'noIsSentenceUnder12Months',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isMappaLevelAbove1',
        text: 'Select whether the MAPPA level is above 1',
        href: '#isMappaLevelAbove1',
        errorId: 'noIsMappaLevelAbove1',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'hasBeenConvictedOfSeriousOffence',
        text: 'Select whether {{ fullName }} has been charged with a serious offence',
        href: '#hasBeenConvictedOfSeriousOffence',
        errorId: 'noHasBeenConvictedOfSeriousOffence',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      hasBeenConvictedOfSeriousOffence: '',
      isMappaLevelAbove1: '',
      isOver18: '',
      isSentenceUnder12Months: '',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
