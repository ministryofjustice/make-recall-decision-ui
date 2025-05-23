import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import spoRecallRationaleController from './spoRecallRationaleController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('present without data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
        statuses: [],
      },
    })
    const next = mockNext()
    await spoRecallRationaleController.get(mockReq(), res, next)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoRecallRationale')
    expect(res.locals.page).toEqual({ id: 'spoRecallRationale' })
    expect(res.locals.inputDisplayValues).toEqual({
      errors: undefined,
      spoRecallRationale: '',
      spoRecallType: undefined,
    })
    expect(res.locals.recallDecided).toEqual(false)
    expect(next).toHaveBeenCalled()
  })
  it('present without data while recall has been decided', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
        statuses: [{ name: STATUSES.SPO_SIGNATURE_REQUESTED, active: true }],
      },
    })

    await spoRecallRationaleController.get(mockReq(), res, mockNext())

    expect(res.locals.page).toEqual({ id: 'spoRecallRationaleRecallDecided' })
    expect(res.locals.recallDecided).toEqual(true)
  })
  it('present without data while spo has signed', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
        statuses: [{ name: STATUSES.SPO_SIGNED, active: true }],
      },
    })

    await spoRecallRationaleController.get(mockReq(), res, mockNext())

    expect(res.locals.page).toEqual({ id: 'spoRecallRationaleRecallDecided' })
    expect(res.locals.recallDecided).toEqual(true)
  })
  it('present previous data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { spoRecallType: 'RECALL', spoRecallRationale: 'some reason' },
        statuses: [],
      },
    })
    await spoRecallRationaleController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues).toEqual({
      errors: undefined,
      spoRecallRationale: 'some reason',
      spoRecallType: 'RECALL',
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
          spoRecallType: 'NO_RECALL',
        },
        recommendation: { spoRecallType: 'NO_RECALL', spoRecallRationale: undefined },
        statuses: [],
      },
    })
    await spoRecallRationaleController.get(mockReq(), res, mockNext())
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
      spoRecallRationale: '',
      spoRecallType: 'NO_RECALL',
    })
  })
})

describe('post', () => {
  const res = mockRes({
    token: 'token1',
    locals: {
      recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
      urlInfo: { basePath: `/recommendations/123/` },
    },
  })

  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        spoRecallType: 'RECALL',
        spoRecallRationale: 'A substantial reason',
        spoNoRecallRationale: '',
      },
    })

    const next = mockNext()

    await spoRecallRationaleController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalled()

    const payload = (updateRecommendation as jest.Mock).mock.calls[0][0]
    expect(payload).toEqual({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        spoRecallType: 'RECALL',
        spoRecallRationale: 'A substantial reason',
        explainTheDecision: true,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/spo-task-list-consider-recall`)
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

    await spoRecallRationaleController.post(req, res, mockNext())

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
      originalUrl: '/recommendations/123/spo-rationale',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        spoRecallType: '',
        spoRecallRationale: '',
        spoNoRecallRationale: '',
      },
    })

    await spoRecallRationaleController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/spo-rationale`)
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
      originalUrl: '/recommendations/123/spo-rationale',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        spoRecallType: 'RECALL',
        spoRecallRationale: '',
      },
    })

    await spoRecallRationaleController.post(req, res, mockNext())

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/spo-rationale`)
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingSpoRecallRationale',
        href: '#spoRecallRationale',
        invalidParts: undefined,
        name: 'spoRecallRationale',
        text: 'Explain your decision',
        values: undefined,
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      spoRecallType: 'RECALL',
      spoRecallRationale: '',
    })
  })
})
