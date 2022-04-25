import { Response } from 'express'
import { mockReq, mockRes } from './testutils/mockRequestUtils'
import { caseSummary } from './caseSummary'
import { getCaseDetails } from '../data/makeDecisionApiClient'
import caseApiResponse from '../../api/responses/get-case-overview.json'

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
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummary(req, res)
    expect(getCaseDetails).toHaveBeenCalledWith(crn.trim(), 'risk', token)
    expect(res.render).toHaveBeenCalledWith('pages/caseSummary')
    expect(res.locals.case).toEqual(caseApiResponse)
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })

  it('should return 400 for an invalid CRN', async () => {
    const invalidCrn = 50 as unknown as string
    const req = mockReq({ params: { crn: invalidCrn, sectionId: 'contact-log' } })
    await caseSummary(req, res)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })

  it('should throw for an invalid section param', async () => {
    const invalidSection = 'recalls'
    ;(getCaseDetails as jest.Mock).mockReturnValueOnce(caseApiResponse)
    const req = mockReq({ params: { crn, sectionId: invalidSection } })
    try {
      await caseSummary(req, res)
    } catch (err) {
      expect(err.message).toEqual('getCaseSectionLabel: invalid sectionId: recalls')
    }
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
