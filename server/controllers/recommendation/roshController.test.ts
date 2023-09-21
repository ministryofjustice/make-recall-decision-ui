import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import roshController from './roshController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({
      currentRoshForPartA: {
        riskToChildren: 'LOW',
        riskToPublic: 'LOW',
        riskToKnownAdult: 'LOW',
        riskToStaff: 'LOW',
        riskToPrisoners: 'LOW',
      },
    })

    const res = mockRes()
    const next = mockNext()
    await roshController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'riskOfSeriousHarm',
      recommendationId: '123',
      token: 'token',
    })

    expect(res.locals.recommendation).toEqual({
      currentRoshForPartA: {
        riskToChildren: 'LOW',
        riskToPublic: 'LOW',
        riskToKnownAdult: 'LOW',
        riskToStaff: 'LOW',
        riskToPrisoners: 'LOW',
      },
    })
    expect(res.locals.page.id).toEqual('rosh')
  })

  it('initial load with error data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({
      currentRoshForPartA: {
        riskToChildren: 'LOW',
        riskToPublic: 'LOW',
        riskToKnownAdult: 'LOW',
        riskToStaff: 'LOW',
        riskToPrisoners: 'LOW',
      },
    })
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'riskToChildren',
              href: '#riskToChildren',
              errorId: 'missingRosh',
              html: 'Select a RoSH level for the risk to children',
            },
          ],
          riskToChildren: {
            text: 'Select a RoSH level for the risk to children',
            href: '#riskToChildren',
            errorId: 'missingRosh',
          },
        },
        recommendation: {
          hasArrestIssues: null,
        },
        token: 'token1',
      },
    })

    await roshController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'riskToChildren',
          href: '#riskToChildren',
          errorId: 'missingRosh',
          html: 'Select a RoSH level for the risk to children',
        },
      ],
      riskToChildren: {
        text: 'Select a RoSH level for the risk to children',
        href: '#riskToChildren',
        errorId: 'missingRosh',
      },
    })
  })
})

describe('post', () => {
  it('post', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        riskToChildren: 'LOW',
        riskToPublic: 'MEDIUM',
        riskToKnownAdult: 'HIGH',
        riskToStaff: 'VERY_HIGH',
        riskToPrisoners: 'NOT_APPLICABLE',
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

    await roshController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        currentRoshForPartA: {
          riskToChildren: 'LOW',
          riskToPublic: 'MEDIUM',
          riskToKnownAdult: 'HIGH',
          riskToStaff: 'VERY_HIGH',
          riskToPrisoners: 'NOT_APPLICABLE',
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-risk-profile`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {},
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await roshController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        name: 'riskToChildren',
        text: 'Select a RoSH level for the risk to children',
        href: '#riskToChildren',
        values: undefined,
        errorId: 'missingRosh',
        invalidParts: undefined,
      },
      {
        name: 'riskToPublic',
        text: 'Select a RoSH level for the risk to the public',
        href: '#riskToPublic',
        values: undefined,
        errorId: 'missingRosh',
        invalidParts: undefined,
      },
      {
        name: 'riskToKnownAdult',
        text: 'Select a RoSH level for the risk to a known adult',
        href: '#riskToKnownAdult',
        values: undefined,
        errorId: 'missingRosh',
        invalidParts: undefined,
      },
      {
        name: 'riskToStaff',
        text: 'Select a RoSH level for the risk to staff',
        href: '#riskToStaff',
        values: undefined,
        errorId: 'missingRosh',
        invalidParts: undefined,
      },
      {
        name: 'riskToPrisoners',
        text: 'Select a RoSH level for the risk to prisoners',
        href: '#riskToPrisoners',
        values: undefined,
        errorId: 'missingRosh',
        invalidParts: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
