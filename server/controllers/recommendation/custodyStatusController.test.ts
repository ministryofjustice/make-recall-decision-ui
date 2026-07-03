import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import custodyStatusController from './custodyStatusController'
import ErrorGenerator from '../../../data/common/errorGenerator'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  const custodyStatus = {
    selected: 'YES_PRISON',
    details: '',
    allOptions: [
      { value: 'YES_PRISON', text: 'Yes, prison custody' },
      { value: 'YES_POLICE', text: 'Yes, police custody' },
      { value: 'NO', text: 'No' },
    ],
  }

  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
      },
    })
    const next = mockNext()
    await custodyStatusController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'custodyStatus' })
    expect(res.locals.inputDisplayValues).toEqual({
      details: undefined,
      value: undefined,
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/custodyStatus')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          custodyStatus,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await custodyStatusController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      details: '',
      value: 'YES_PRISON',
    })
  })

  it('initial load with error data', async () => {
    const errorList = ErrorGenerator.generate()
    const res = mockRes({
      locals: {
        errors: {
          list: errorList,
        },
        recommendation: {
          custodyStatus,
        },
        token: 'token1',
      },
    })

    await custodyStatusController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: errorList,
    })
  })
})

describe('post', () => {
  it(`post with valid data and YES_POLICE with additional details`, async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        custodyStatus: 'YES_POLICE',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
        flags: {},
      },
    })
    const next = mockNext()

    await custodyStatusController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        custodyStatus: {
          selected: 'YES_POLICE',
          allOptions: [
            { value: 'YES_PRISON', text: 'Yes, prison custody' },
            { value: 'YES_POLICE', text: 'Yes, police custody' },
            { value: 'NO', text: 'No' },
          ],
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/share-case-with-admin`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it("post with valid data and YES_POLICE doesn't require additional details", async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        custodyStatus: 'YES_POLICE',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
        flags: {},
      },
    })
    const next = mockNext()

    await custodyStatusController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        custodyStatus: {
          selected: 'YES_POLICE',
          allOptions: [
            { value: 'YES_PRISON', text: 'Yes, prison custody' },
            { value: 'YES_POLICE', text: 'Yes, police custody' },
            { value: 'NO', text: 'No' },
          ],
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/share-case-with-admin`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})

it('post with invalid data', async () => {
  ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

  const req = mockReq({
    originalUrl: 'some-url',
    params: { recommendationId: '123' },
    body: {
      custodyStatus: 'YES_POLIC',
    },
  })

  const res = mockRes({
    locals: {
      user: { token: 'token1' },
      recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
      urlInfo: { basePath: `/recommendations/123/` },
      flags: {},
    },
  })

  await custodyStatusController.post(req, res, mockNext())

  expect(updateRecommendation).not.toHaveBeenCalled()
  expect(req.session.errors).toEqual([
    {
      errorId: 'noCustodyStatusSelected',
      href: '#custodyStatus',
      invalidParts: undefined,
      name: 'custodyStatus',
      text: 'Select whether the person is in custody or not',
      values: undefined,
    },
  ])
  expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
})
