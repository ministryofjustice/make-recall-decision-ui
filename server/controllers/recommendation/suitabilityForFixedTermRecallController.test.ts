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
      caseSummary: { licence: 'case summary data' },
    })
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { mappa: 'mappa summary data' },
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
    expect(res.locals.caseSummary).toEqual({ licence: 'case summary data', mappa: 'mappa summary data' })
    expect(res.locals.inputDisplayValues.isUnder18).not.toBeDefined()
    expect(res.locals.inputDisplayValues.isSentence12MonthsOrOver).not.toBeDefined()
    expect(res.locals.inputDisplayValues.isMappaLevelAbove1).not.toBeDefined()
    expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { licence: 'case summary data' },
    })
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { mappa: 'mappa summary data' },
    })
    const res = mockRes({
      locals: {
        recommendation: {
          isUnder18: true,
          isSentence12MonthsOrOver: true,
          isMappaLevelAbove1: true,
          hasBeenConvictedOfSeriousOffence: true,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues.isUnder18).toEqual('YES')
    expect(res.locals.inputDisplayValues.isSentence12MonthsOrOver).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaLevelAbove1).toEqual('YES')
    expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence).toEqual('YES')
  })

  it('load with existing data inverted', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { licence: 'case summary data' },
    })
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { mappa: 'mappa summary data' },
    })
    const res = mockRes({
      locals: {
        recommendation: {
          isUnder18: false,
          isSentence12MonthsOrOver: false,
          isMappaLevelAbove1: true,
          hasBeenConvictedOfSeriousOffence: true,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues.isUnder18).toEqual('NO')
    expect(res.locals.inputDisplayValues.isSentence12MonthsOrOver).toEqual('NO')
  })

  it('load with errors', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { licence: 'case summary data' },
    })
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { mappa: 'mappa summary data' },
    })
    const res = mockRes({
      locals: {
        unsavedValues: {
          isUnder18: false,
          isSentence12MonthsOrOver: false,
          isMappaLevelAbove1: false,
          hasBeenConvictedOfSeriousOffence: false,
        },
        recommendation: {
          isUnder18: true,
          isSentence12MonthsOrOver: true,
          isMappaLevelAbove1: true,
          hasBeenConvictedOfSeriousOffence: true,
        },
        token: 'token1',
        errors: {
          isUnder18: {
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isUnder18',
            errorId: 'noisUnder18',
          },
          list: [
            {
              name: 'isUnder18',
              text: 'Select whether {{ fullName }} is 18 or over',
              href: '#isUnder18',
              errorId: 'noisUnder18',
            },
          ],
        },
      },
    })
    const next = mockNext()
    await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues.errors).toEqual({
      isUnder18: {
        text: 'Select whether {{ fullName }} is 18 or over',
        href: '#isUnder18',
        errorId: 'noisUnder18',
      },
      list: [
        {
          name: 'isUnder18',
          text: 'Select whether {{ fullName }} is 18 or over',
          href: '#isUnder18',
          errorId: 'noisUnder18',
        },
      ],
    })
    expect(res.locals.inputDisplayValues.isUnder18).toEqual('YES')
    expect(res.locals.inputDisplayValues.isSentence12MonthsOrOver).toEqual('YES')
    expect(res.locals.inputDisplayValues.isMappaLevelAbove1).toEqual('YES')
    expect(res.locals.inputDisplayValues.hasBeenConvictedOfSeriousOffence).toEqual('YES')
  })

  it('initial load with error data', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { licence: 'case summary data' },
    })
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { mappa: 'mappa summary data' },
    })
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'isUnder18',
              text: 'Select whether {{ fullName }} is 18 or over',
              href: '#isUnder18',
              errorId: 'noisUnder18',
            },
          ],
          isUnder18: {
            text: 'Select whether {{ fullName }} is 18 or over',
            href: '#isUnder18',
            errorId: 'noisUnder18',
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
      isUnder18: {
        text: 'Select whether {{ fullName }} is 18 or over',
        href: '#isUnder18',
        errorId: 'noisUnder18',
      },
      list: [
        {
          name: 'isUnder18',
          text: 'Select whether {{ fullName }} is 18 or over',
          href: '#isUnder18',
          errorId: 'noisUnder18',
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
        isUnder18: 'YES',
        isSentence12MonthsOrOver: 'YES',
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
        isUnder18: true,
        isSentence12MonthsOrOver: true,
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
        isUnder18: '',
        isSentence12MonthsOrOver: '',
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
        name: 'isUnder18',
        text: 'Select whether {{ fullName }} is under 18',
        href: '#isUnder18',
        errorId: 'noIsUnder18',
        invalidParts: undefined,
        values: undefined,
      },
      {
        name: 'isSentence12MonthsOrOver',
        text: 'Select whether the sentence is 12 months or over',
        href: '#isSentence12MonthsOrOver',
        errorId: 'noIsSentence12MonthsOrOver',
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
      isUnder18: '',
      isSentence12MonthsOrOver: '',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
