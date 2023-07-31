import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import countersigningTelephoneController from './countersigningTelephoneController'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data for SPO', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_SIGNATURE_REQUESTED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {},
      },
    })
    const next = mockNext()
    await countersigningTelephoneController.get(mockReq(), res, next)

    expect(res.locals.mode).toEqual('SPO')
    expect(res.locals.page).toEqual({ id: 'countersigningTelephone' })
    expect(res.locals.inputDisplayValues).toEqual({
      details: undefined,
      value: undefined,
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/countersigningTelephone')

    expect(next).toHaveBeenCalled()
  })

  it('load with no data for ACO', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.ACO_SIGNATURE_REQUESTED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {},
      },
    })
    const next = mockNext()
    await countersigningTelephoneController.get(mockReq(), res, next)

    expect(res.locals.mode).toEqual('ACO')
    expect(res.locals.page).toEqual({ id: 'countersigningTelephone' })
    expect(res.locals.inputDisplayValues).toEqual({
      details: undefined,
      value: undefined,
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/countersigningTelephone')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data for SPO telephone', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_SIGNATURE_REQUESTED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          countersignSpoTelephone: '12345678',
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await countersigningTelephoneController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      value: '12345678',
    })
  })
  it('load with existing data for SPO telephone', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.ACO_SIGNATURE_REQUESTED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          countersignSpoTelephone: '98765423',
          countersignAcoTelephone: '123456789',
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await countersigningTelephoneController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      value: '123456789',
    })
  })
})

describe('post', () => {
  it('post with valid data for SPO', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        mode: 'SPO',
        telephone: '555555',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: {},
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await countersigningTelephoneController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        countersignSpoTelephone: '555555',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/spo-countersignature`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with valid data for ACO', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        mode: 'ACO',
        telephone: '444',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: {},
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await countersigningTelephoneController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        countersignAcoTelephone: '444',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/aco-countersignature`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
