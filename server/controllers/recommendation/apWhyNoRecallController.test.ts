import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import apWhyNoRecallController from './apWhyNoRecallController'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('present without data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallRationale: undefined },
      },
    })
    const next = mockNext()
    await apWhyNoRecallController.get(mockReq(), res, next)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/apWhyNoRecall')
    expect(res.locals.page).toEqual({ id: 'apWhyNoRecall' })
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
    await apWhyNoRecallController.get(mockReq(), res, mockNext())
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
        unsavedValues: {
          spoNoRecallRationale: 'a rationale that belongs to no recall',
          odmName: 'mr bloggs',
        },
        recommendation: { spoRecallRationale: undefined },
      },
    })
    await apWhyNoRecallController.get(mockReq(), res, mockNext())
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
      odmName: 'mr bloggs',
      spoNoRecallRationale: 'a rationale that belongs to no recall',
    })
  })
})

describe('post', () => {
  const res = mockRes({
    token: 'token1',
    locals: {
      recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
      urlInfo: { basePath: `/recommendations/123/` },
      user: {
        token: 'token',
        hasOdmRole: true,
      },
      statuses: [],
    },
  })

  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        spoNoRecallRationale: 'A substantial reason',
      },
    })

    const next = mockNext()

    await apWhyNoRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalled()

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.AP_COLLECTED_RATIONALE],
      deActivate: [],
    })

    const payload = (updateRecommendation as jest.Mock).mock.calls[0][0]
    expect(payload).toEqual({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        explainTheDecision: true,
        spoRecallRationale: 'A substantial reason',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-record-decision`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data - no recall rationale', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: '/recommendations/123/ap-why-no-recall',
      params: { recommendationId: '123' },
      body: {
        spoNoRecallRationale: '',
      },
    })

    await apWhyNoRecallController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-why-no-recall`)
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingSpoNoRecallRationale',
        href: '#spoNoRecallRationale',
        invalidParts: undefined,
        name: 'spoNoRecallRationale',
        text: 'Explain your decision',
        values: undefined,
      },
    ])
  })
  it('post with invalid data - no out of hours manager', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: '/recommendations/123/ap-why-no-recall',
      params: { recommendationId: '123' },
      body: {
        spoNoRecallRationale: 'something',
      },
    })

    const response = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
        user: {
          token: 'token',
          hasOdmRole: false,
        },
      },
    })

    await apWhyNoRecallController.post(req, response, mockNext())

    expect(response.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-why-no-recall`)
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingOdmName',
        href: '#odmName',
        invalidParts: undefined,
        name: 'odmName',
        text: 'Provide an out-of-hours manager name',
        values: undefined,
      },
    ])
  })
})
