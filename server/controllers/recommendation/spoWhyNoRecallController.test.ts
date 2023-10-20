import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import spoWhyNoRecallController from './spoWhyNoRecallController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('present without data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallRationale: undefined },
      },
    })
    const next = mockNext()
    await spoWhyNoRecallController.get(mockReq(), res, next)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoWhyNoRecall')
    expect(res.locals.page).toEqual({ id: 'spoWhyNoRecall' })
    expect(res.locals.inputDisplayValues).toEqual({
      errors: undefined,
      spoNoRecallRationale: undefined,
    })
    expect(next).toHaveBeenCalled()
  })

  it('present previous data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallRationale: 'some reason' },
      },
    })
    await spoWhyNoRecallController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues).toEqual({
      errors: undefined,
      spoNoRecallRationale: 'some reason',
    })
  })
  it('present with errors', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'spoNoRecallRationale',
              href: '#spoNoRecallRationale',
              errorId: 'missingSpoNoRecallRationale',
              html: 'Enter the no recall rationale',
            },
          ],
          spoNoRecallRationale: {
            text: 'Enter the no recall rationale',
            href: '#spoNoRecallRationale',
            errorId: 'missingSpoNoRecallRationale',
          },
        },
        recommendation: { spoRecallRationale: undefined },
      },
    })
    await spoWhyNoRecallController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues).toEqual({
      errors: {
        list: [
          {
            name: 'spoNoRecallRationale',
            href: '#spoNoRecallRationale',
            errorId: 'missingSpoNoRecallRationale',
            html: 'Enter the no recall rationale',
          },
        ],
        spoNoRecallRationale: {
          text: 'Enter the no recall rationale',
          href: '#spoNoRecallRationale',
          errorId: 'missingSpoNoRecallRationale',
        },
      },
      spoNoRecallRationale: '',
    })
  })
})

describe('post', () => {
  const res = mockRes({
    token: 'token1',
    locals: {
      recommendation: { personOnProbation: { name: 'Harry Smith' } },
      urlInfo: { basePath: `/recommendations/123/` },
    },
  })

  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        spoNoRecallRationale: 'a good reason',
      },
    })

    const next = mockNext()

    await spoWhyNoRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalled()

    const payload = (updateRecommendation as jest.Mock).mock.calls[0][0]
    expect(payload).toEqual({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        explainTheDecision: true,
        spoRecallRationale: 'a good reason',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/spo-senior-manager-endorsement`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data - no recall rationale', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: '/recommendations/123/spo-why-no-recall',
      params: { recommendationId: '123' },
      body: {
        spoNoRecallRationale: '',
      },
    })

    await spoWhyNoRecallController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/spo-why-no-recall`)
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingSpoNoRecallRationale',
        href: '#spoNoRecallRationale',
        invalidParts: undefined,
        name: 'spoNoRecallRationale',
        text: 'You must explain your decision',
        values: undefined,
      },
    ])
  })
})
