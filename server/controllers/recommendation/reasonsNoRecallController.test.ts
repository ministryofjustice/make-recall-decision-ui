import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import reasonsNoRecallController from './reasonsNoRecallController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
      },
    })
    const next = mockNext()
    await reasonsNoRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'reasonsForNoRecall' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/reasonsForNoRecall')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          reasonsForNoRecall: {
            licenceBreach: 'test 1',
            noRecallRationale: 'test 2',
            popProgressMade: 'test 3',
            popThoughts: 'test 4',
            futureExpectations: 'test 5',
          },
        },
      },
    })
    const next = mockNext()
    await reasonsNoRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      licenceBreach: 'test 1',
      noRecallRationale: 'test 2',
      popProgressMade: 'test 3',
      popThoughts: 'test 4',
      futureExpectations: 'test 5',
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        unsavedValues: { recallType: 'STANDARD' },
        errors: {
          list: [
            {
              name: 'licenceBreach',
              href: '#licenceBreach',
              errorId: 'noRecallLicenceBreachDetails',
              html: 'You must explain the licence breach',
            },
            {
              name: 'popProgressMade',
              href: '#popProgressMade',
              errorId: 'noRecallPopProgressMade',
              html: 'You must explain what progress Harry Smith has made so far',
            },
          ],
          licenceBreach: {
            text: 'You must explain the licence breach',
            href: '#licenceBreach',
            errorId: 'noRecallLicenceBreachDetails',
          },
          popProgressMade: {
            text: 'You must explain what progress Harry Smith has made so far',
            href: '#popProgressMade',
            errorId: 'noRecallPopProgressMade',
          },
        },
      },
    })

    await reasonsNoRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'licenceBreach',
          href: '#licenceBreach',
          errorId: 'noRecallLicenceBreachDetails',
          html: 'You must explain the licence breach',
        },
        {
          name: 'popProgressMade',
          href: '#popProgressMade',
          errorId: 'noRecallPopProgressMade',
          html: 'You must explain what progress Harry Smith has made so far',
        },
      ],
      licenceBreach: {
        text: 'You must explain the licence breach',
        href: '#licenceBreach',
        errorId: 'noRecallLicenceBreachDetails',
      },
      popProgressMade: {
        text: 'You must explain what progress Harry Smith has made so far',
        href: '#popProgressMade',
        errorId: 'noRecallPopProgressMade',
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
        licenceBreach: 'test 1',
        noRecallRationale: 'test 3',
        popProgressMade: 'test 4',
        popThoughts: 'test 5',
        futureExpectations: 'test 6',
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

    await reasonsNoRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        reasonsForNoRecall: {
          licenceBreach: 'test 1',
          noRecallRationale: 'test 3',
          popProgressMade: 'test 4',
          popThoughts: 'test 5',
          futureExpectations: 'test 6',
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/appointment-no-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        licenceBreach: '',
        noRecallRationale: 'test 3',
        popProgressMade: 'test 4',
        popThoughts: 'test 5',
        futureExpectations: 'test 6',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await reasonsNoRecallController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noRecallLicenceBreachDetails',
        href: '#licenceBreach',
        text: 'You must tell {{ fullName }} why the licence breach is a problem',
        name: 'licenceBreach',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
