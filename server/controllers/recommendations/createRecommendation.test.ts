import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { createRecommendationController } from './createRecommendation'
import { createRecommendation } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

const crn = ' A1234AB '
let res: Response
const token = 'token'

describe('createRecommendationController', () => {
  beforeEach(() => {
    res = mockRes({ token, locals: { user: { username: 'Dave' } } })
  })

  it('should redirect if successful', async () => {
    ;(createRecommendation as jest.Mock).mockReturnValueOnce({ id: '123' })
    const req = mockReq({ body: { crn } })
    await createRecommendationController(req, res)
    expect(createRecommendation).toHaveBeenCalledWith(crn.trim(), token)
    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/recall-type')
    expect(req.session.errors).toBeUndefined()
  })

  it('should reload with a stored error, on a failed API call', async () => {
    ;(createRecommendation as jest.Mock).mockRejectedValue(new Error('API error'))
    const req = mockReq({ body: { crn } })
    await createRecommendationController(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/cases/${crn.trim()}/overview`)
    expect(req.session.errors).toEqual([
      {
        name: 'saveError',
        text: 'An error occurred creating a new recommendation',
      },
    ])
  })
})
