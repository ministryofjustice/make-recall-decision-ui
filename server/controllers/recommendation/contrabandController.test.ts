import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import contrabandController from './contrabandController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        token: 'token1',
      },
    })
    const next = mockNext()
    await contrabandController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'contraband' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/contraband')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isThisAncontraband: false,
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await contrabandController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({ details: undefined, value: undefined })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: {
          list: [
            {
              name: 'hasContrabandRisk',
              href: '#hasContrabandRisk',
              errorId: 'noContrabandSelected',
              html: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
            },
          ],
          isThisAncontraband: {
            text: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
            href: '#hasContrabandRisk',
            errorId: 'noContrabandSelected',
          },
        },
        recommendation: {
          isThisAncontraband: undefined,
        },
        token: 'token1',
      },
    })

    await contrabandController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          name: 'hasContrabandRisk',
          href: '#hasContrabandRisk',
          errorId: 'noContrabandSelected',
          html: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
        },
      ],
      isThisAncontraband: {
        text: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
        href: '#hasContrabandRisk',
        errorId: 'noContrabandSelected',
      },
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
        hasContrabandRisk: 'YES',
        hasContrabandRiskDetailsYes: 'stuff and bother',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await contrabandController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      valuesToSave: {
        hasContrabandRisk: {
          selected: true,
          details: 'stuff and bother',
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-custody`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await contrabandController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'noContrabandSelected',
        href: '#hasContrabandRisk',
        text: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
        name: 'hasContrabandRisk',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
