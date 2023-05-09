import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import managerCountersignatureController from './managerCountersignatureController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: 'SPO_SIGNATURE_REQUESTED', active: true }])
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await managerCountersignatureController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'managerCountersignature' })
    expect(res.locals.backLink).toEqual('countersigning-telephone')
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/managerCountersignature')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data for SPO', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: 'SPO_SIGNATURE_REQUESTED', active: true }])
    const res = mockRes({
      locals: {
        recommendation: { countersignSpoExposition: 'lorem ipsum blah blah blah' },
      },
    })

    await managerCountersignatureController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('lorem ipsum blah blah blah')
  })

  it('load with existing data for ACO', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: 'ACO_SIGNATURE_REQUESTED', active: true }])
    const res = mockRes({
      locals: {
        recommendation: { countersignAcoExposition: 'lorem ipsum blah blah blah' },
      },
    })

    await managerCountersignatureController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('lorem ipsum blah blah blah')
  })

  it('initial load with error data', async () => {
    const errors = {
      list: [
        {
          name: 'managerCountersignatureExposition',
          href: '#managerCountersignatureExposition',
          errorId: 'missingManagerCountersignatureExposition',
          html: 'You must add a comment to confirm your countersignature',
        },
      ],
      managerCountersignatureExposition: {
        text: 'You must add a comment to confirm your countersignature',
        href: '#managerCountersignatureExposition',
        errorId: 'missingManagerCountersignatureExposition',
      },
    }
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: 'SPO_SIGNATURE_REQUESTED', active: true }])
    const res = mockRes({
      locals: {
        errors,
        recommendation: { countersignSpoExposition: 'lorem ipsum' },
      },
    })

    await managerCountersignatureController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('lorem ipsum')
    expect(res.locals.inputDisplayValues.errors).toEqual(errors)
  })
})

describe('post', () => {
  it('post with valid data for SPO', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: { mode: 'SPO', value: 'some value' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
        flags: {},
      },
    })
    const next = mockNext()

    await managerCountersignatureController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        countersignSpoExposition: 'some value',
      },
      featureFlags: {},
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      deActivate: ['SPO_SIGNATURE_REQUESTED'],
      activate: ['SPO_SIGNED'],
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/xyz`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with valid data for ACO', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: { mode: 'ACO', value: 'some value' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
        flags: {},
      },
    })
    const next = mockNext()

    await managerCountersignatureController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        countersignAcoExposition: 'some value',
      },
      featureFlags: {},
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      deActivate: ['ACO_SIGNATURE_REQUESTED'],
      activate: ['ACO_SIGNED'],
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/xyz`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { mode: 'SPO', value: '' },
    })

    const res = mockRes({
      locals: {
        flags: {},
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await managerCountersignatureController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingManagerCountersignatureExposition',
        href: '#managerCountersignatureExposition',
        invalidParts: undefined,
        name: 'managerCountersignatureExposition',
        text: 'You must add a comment to confirm your countersignature',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
