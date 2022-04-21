import { Response } from 'express'
import { mockReq, mockRes } from './testutils/mockRequestUtils'
import { caseSummary } from './caseSummary'
import { getCaseDetails } from '../data/makeDecisionApiClient'
import caseApiResponse from '../../api/responses/get-case.json'

jest.mock('../data/makeDecisionApiClient')

const crn = ' A1234AB '
let res: Response
const token = 'token'

describe('caseSummary', () => {
  beforeEach(() => {
    res = mockRes({ token })
  })

  it('should return case details for a valid CRN', async () => {
    ;(getCaseDetails as jest.Mock).mockReturnValueOnce(caseApiResponse)
    const req = mockReq({ params: { crn } })
    await caseSummary(req, res)
    expect(getCaseDetails).toHaveBeenCalledWith(crn.trim(), token)
    expect(res.render).toHaveBeenCalledWith('pages/caseSummary')
    expect(res.locals.case).toEqual(caseApiResponse)
  })

  it('should return 400 if invalid CRN submitted', async () => {
    const invalidCrn = 50 as unknown as string
    const req = mockReq({ params: { crn: invalidCrn } })
    await caseSummary(req, res)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })

  it('should throw if the API call errors', async () => {
    const apiError = { status: 500 }
    ;(getCaseDetails as jest.Mock).mockRejectedValue(apiError)
    const req = mockReq({ query: { crn } })
    try {
      await caseSummary(req, res)
    } catch (err) {
      expect(err).toEqual(apiError)
    }
  })
})
