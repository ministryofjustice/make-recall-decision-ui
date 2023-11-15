import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import previousReleasesController from './previousReleasesController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({
      releaseUnderECSL: true,
      dateOfRelease: '2001-01-02',
      conditionalReleaseDate: '2003-04-05',
    })
    const res = mockRes()
    const next = mockNext()
    await previousReleasesController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'previousReleases',
      recommendationId: '123',
      token: 'token',
    })

    expect(res.locals.recommendation).toEqual({
      conditionalReleaseDate: '2003-04-05',
      dateOfRelease: '2001-01-02',
      releaseUnderECSL: true,
    })
    expect(res.locals.page.id).toEqual('previousReleases')
    expect(res.locals.inputDisplayValues).toEqual({
      conditionalReleaseDate: {
        day: '05',
        month: '04',
        year: '2003',
      },
      dateOfRelease: {
        day: '02',
        month: '01',
        year: '2001',
      },
      releaseUnderECSL: 'YES',
    })
  })
  it('load with errors', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({
      releaseUnderECSL: true,
      dateOfRelease: '2001-01-02',
      conditionalReleaseDate: '2003-04-05',
    })
    const res = mockRes({
      locals: {
        errors: [],
        unsavedValues: {
          releaseUnderECSL: 'YES',
          dateOfRelease: { day: '03', month: '04', year: '2002' },
          conditionalReleaseDate: { day: '06', month: '05', year: '2004' },
        },
      },
    })
    const next = mockNext()
    await previousReleasesController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'previousReleases',
      recommendationId: '123',
      token: 'token',
    })

    expect(res.locals.recommendation).toEqual({
      conditionalReleaseDate: '2003-04-05',
      dateOfRelease: '2001-01-02',
      releaseUnderECSL: true,
    })
    expect(res.locals.page.id).toEqual('previousReleases')
    expect(res.locals.inputDisplayValues).toEqual({
      conditionalReleaseDate: {
        day: '06',
        month: '05',
        year: '2004',
      },
      dateOfRelease: {
        day: '03',
        month: '04',
        year: '2002',
      },
      releaseUnderECSL: 'YES',
    })
  })
})

describe('post', () => {
  it('post continue', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        continueButton: '1',
        releaseUnderECSL: 'YES',
        'dateOfRelease-day': '12',
        'dateOfRelease-month': '11',
        'dateOfRelease-year': '2012',
        'conditionalReleaseDate-day': '23',
        'conditionalReleaseDate-month': '06',
        'conditionalReleaseDate-year': '2121',
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

    await previousReleasesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        releaseUnderECSL: true,
        previousReleases: {
          hasBeenReleasedPreviously: true,
        },
        dateOfRelease: '2012-11-12',
        conditionalReleaseDate: '2121-06-23',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-person-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post delete', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        previousReleaseDates: '2005-01-01|',
        deletePreviousReleaseDateIndex: '0',
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

    await previousReleasesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        previousReleases: {
          previousReleaseDates: [],
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/previous-releases`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
