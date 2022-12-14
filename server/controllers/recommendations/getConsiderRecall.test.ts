import { Request, Response } from 'express'
import { getConsiderRecall } from './getConsiderRecall'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import getCaseResponse from '../../../api/responses/get-case-personal-details.json'
import getCaseExcluded from '../../../api/responses/get-case-excluded.json'

jest.mock('../../data/makeDecisionApiClient')

describe('getConsiderRecall', () => {
  const accessToken = 'abc'
  const crn = '123'
  let req: Request
  let res: Response

  beforeEach(() => {
    req = mockReq({ params: { crn, pageUrlSlug: 'custody-status' } })
    res = mockRes({ token: accessToken })
  })

  it('fetches case summary data', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(getCaseResponse)
    await getConsiderRecall(req, res)
    expect(getCaseSummary).toHaveBeenCalledWith(crn, 'personal-details', 'abc')
  })

  it('renders the excluded page if case is excluded', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(getCaseExcluded)
    await getConsiderRecall(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/excludedRestrictedCrn')
  })

  it('sets input display value to API value if no errors', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce({
      ...getCaseResponse,
      activeRecommendation: {
        recallConsideredList: [
          {
            recallConsideredDetail: 'There has been a change in behaviour',
          },
        ],
      },
    })
    await getConsiderRecall(req, res)
    expect(res.locals.inputDisplayValue).toEqual('There has been a change in behaviour')
  })

  it('sets input display value to empty string if there are validation errors', async () => {
    res.locals.errors = [{}]
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce({
      ...getCaseResponse,
      activeRecommendation: {
        recallConsideredList: [
          {
            recallConsideredDetail: 'There has been a change in behaviour',
          },
        ],
      },
    })
    await getConsiderRecall(req, res)
    expect(res.locals.inputDisplayValue).toEqual('')
  })
})
