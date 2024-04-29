import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import addPpudMinuteController from './addPpudMinuteController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import generateId from '../../utils/generateId'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../utils/generateId')

describe('get', () => {
  it('load', async () => {
    const req = mockReq()
    const res = mockRes()
    const next = mockNext()
    await addPpudMinuteController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'addPpudMinute' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/addPpudMinute')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post minute', async () => {
    ;(generateId as jest.Mock).mockReturnValueOnce('kE8uAXkRIA')
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: {
        recommendationId: '1234',
      },
      body: {
        minute: 'some text',
      },
    })
    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()
    await addPpudMinuteController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          minutes: [{ id: 'kE8uAXkRIA', text: 'some text' }],
        },
      },
      token: 'token1',
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1234/supporting-documents`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with no minute', async () => {
    const req = mockReq({
      originalUrl: 'some-url',
      params: {
        recommendationId: '1234',
      },
      body: {
        minute: '',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1234/` },
      },
    })
    const next = mockNext()
    await addPpudMinuteController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1234/supporting-documents`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
