import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import apRecallRationaleController from './apRecallRationaleController'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('present without data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
        statuses: [],
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
        },
      },
    })
    const next = mockNext()
    await apRecallRationaleController.get(mockReq(), res, next)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/apRecallRationale')
    expect(res.locals.page).toEqual({ id: 'apRecallRationale' })
    expect(res.locals.inputDisplayValues).toEqual({
      errors: undefined,
      spoRecallRationale: undefined,
      spoRecallType: undefined,
    })
    expect(next).toHaveBeenCalled()
  })
  it('present previous data', async () => {
    const res = mockRes({
      locals: {
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
        },
        recommendation: { spoRecallType: 'RECALL', spoRecallRationale: 'some reason', odmName: 'Boss Dave' },
        statuses: [],
      },
    })
    await apRecallRationaleController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues).toEqual({
      errors: undefined,
      spoRecallRationale: 'some reason',
      spoRecallType: 'RECALL',
      odmName: 'Boss Dave',
    })
  })
  it('present with errors', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'spoRecallRationale',
              href: '#spoRecallRationale',
              errorId: 'missingSpoRecallRationale',
              html: 'Enter the recall rationale',
            },
          ],
          spoRecallRationale: {
            text: 'Enter the recall rationale',
            href: '#spoRecallRationale',
            errorId: 'missingSpoRecallRationale',
          },
        },
        unsavedValues: {
          spoRecallType: 'RECALL',
          spoRecallRationale: 'a rationale that belongs to recall',
          odmName: 'mr sparky',
        },
        recommendation: { spoRecallType: 'NO_RECALL', spoRecallRationale: undefined },
        statuses: [],
        user: {
          username: 'Dave',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
        },
      },
    })
    await apRecallRationaleController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues).toEqual({
      errors: {
        list: [
          {
            name: 'spoRecallRationale',
            href: '#spoRecallRationale',
            errorId: 'missingSpoRecallRationale',
            html: 'Enter the recall rationale',
          },
        ],
        spoRecallRationale: {
          text: 'Enter the recall rationale',
          href: '#spoRecallRationale',
          errorId: 'missingSpoRecallRationale',
        },
      },
      spoRecallType: 'RECALL',
      spoRecallRationale: 'a rationale that belongs to recall',
      odmName: 'mr sparky',
    })
  })
})

describe('post', () => {
  const res = mockRes({
    token: 'token1',
    locals: {
      recommendation: { personOnProbation: { name: 'Harry Smith' } },
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
        crn: 'X098092',
        spoRecallType: 'RECALL',
        spoRecallRationale: 'a good reason',
        spoNoRecallRationale: '',
      },
    })

    const next = mockNext()

    await apRecallRationaleController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalled()

    const payload = (updateRecommendation as jest.Mock).mock.calls[0][0]
    expect(payload).toEqual({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        spoRecallType: 'RECALL',
        spoRecallRationale: 'a good reason',
        explainTheDecision: true,
      },
      featureFlags: {},
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.AP_COLLECTED_RATIONALE],
      deActivate: [],
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-record-decision`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with valid data for NO_RECALL', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        spoRecallType: 'NO_RECALL',
        spoRecallRationale: '',
      },
    })

    await apRecallRationaleController.post(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalled()

    const payload = (updateRecommendation as jest.Mock).mock.calls[0][0]
    expect(payload).toEqual({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        spoRecallType: 'NO_RECALL',
      },
      featureFlags: {},
    })
  })

  it('post with invalid data - no recall type', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: '/recommendations/123/ap-recall-rationale',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        spoRecallType: '',
        spoRecallRationale: '',
        spoNoRecallRationale: '',
      },
    })

    await apRecallRationaleController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-recall-rationale`)
    expect(req.session.errors).toEqual([
      {
        errorId: 'noSpoRecallTypeSelected',
        href: '#spoRecallType',
        invalidParts: undefined,
        name: 'spoRecallType',
        text: 'Select whether you have decided to recall or made a decision not to recall',
        values: undefined,
      },
    ])
  })

  it('post with invalid data - no recall rationale', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: '/recommendations/123/ap-recall-rationale',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        spoRecallType: 'RECALL',
        spoRecallRationale: '',
      },
    })

    await apRecallRationaleController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-recall-rationale`)
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingSpoRecallRationale',
        href: '#spoRecallRationale',
        invalidParts: undefined,
        name: 'spoRecallRationale',
        text: 'You must explain your decision',
        values: undefined,
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      spoRecallType: 'RECALL',
      spoRecallRationale: '',
    })
  })

  it('post with invalid data - no out of hours manager', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: '/recommendations/123/ap-recall-rationale',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        spoRecallType: 'RECALL',
        spoRecallRationale: 'something',
      },
    })

    const response = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
        user: {
          token: 'token',
          hasOdmRole: false,
        },
      },
    })

    await apRecallRationaleController.post(req, response, mockNext())

    expect(response.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-recall-rationale`)
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingOdmName',
        href: '#odmName',
        invalidParts: undefined,
        name: 'odmName',
        text: 'You must provide an out-of-hours manager name',
        values: undefined,
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      spoRecallType: 'RECALL',
      spoRecallRationale: 'something',
    })
  })
})
