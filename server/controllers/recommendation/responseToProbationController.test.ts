import responseToProbationController from './responseToProbationController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    responseToProbationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'responseToProbation' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/responseToProbation')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { responseToProbation: 'lorem ipsum' },
      },
    })

    responseToProbationController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('lorem ipsum')
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        errors: { responseToProbation: { text: 'val' } },
        recommendation: { responseToProbation: 'lorem ipsum' },
      },
    })

    responseToProbationController.get(mockReq(), res, mockNext())
    expect(res.locals.inputDisplayValues.value).toEqual('')
    expect(res.locals.inputDisplayValues.errors).toEqual({ responseToProbation: { text: 'val' } })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: { responseToProbation: 'some value' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await responseToProbationController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        responseToProbation: 'some value',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list-consider-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { responseToProbation: '' },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await responseToProbationController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingResponseToProbation',
        href: '#responseToProbation',
        invalidParts: undefined,
        name: 'responseToProbation',
        text: 'You must explain how {{ fullName }} has responded to probation',
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
