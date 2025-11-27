import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import editLegislationReleasedUnderController from './editLegislationReleasedUnderController'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: ['one', 'two', 'three'] })

    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          ...recommendationApiResponse,
        },
      },
    })
    const next = mockNext()
    await editLegislationReleasedUnderController.get(req, res, next)

    expect(ppudReferenceList).toHaveBeenCalledWith('token', 'released-unders')

    expect(res.locals.page).toEqual({ id: 'editLegislationReleasedUnder' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editLegislationReleasedUnder')
    expect(res.locals.legislations).toEqual([
      { text: 'Enter legislation', value: '' },
      { text: 'one', value: 'one' },
      { text: 'two', value: 'two' },
      { text: 'three', value: 'three' },
    ])
    expect(next).toHaveBeenCalled()
  })

  it('redirects if custodyGroup is indeterminate', async () => {
    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          ...recommendationApiResponse,
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.INDETERMINATE,
          },
        },
      },
    })
    const next = mockNext()

    await editLegislationReleasedUnderController.get(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/recommendations/123/check-booking-details')
    expect(next).not.toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    const recommendation = {
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
    }
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/1/`
    const legislationReleasedUnder = 'blue'
    const req = mockReq({
      params: { recommendationId: recommendation.id.toString() },
      body: {
        legislationReleasedUnder,
      },
    })

    const token = 'token1'

    const featureFlags = { xyz: true }

    const res = mockRes({
      token,
      locals: {
        user: { token },
        urlInfo: { basePath },
        flags: featureFlags,
      },
    })
    const next = mockNext()

    await editLegislationReleasedUnderController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: req.params.recommendationId,
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: recommendation.bookRecallToPpud.policeForce,
          legislationReleasedUnder,
          legislationSentencedUnder: legislationReleasedUnder,
        },
      },
      token,
      featureFlags,
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with invalid data', async () => {
    const basePath = `/recommendations/1/`
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editLegislationReleasedUnderController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingLegislationReleasedUnder',
        invalidParts: undefined,
        href: '#legislationReleasedUnder',
        name: 'legislationReleasedUnder',
        text: 'Enter legislation',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
