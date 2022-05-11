import { Response } from 'express'
import { mockReq, mockRes } from './testutils/mockRequestUtils'
import { caseSummary } from './caseSummary'
import { getCaseDetails } from '../data/makeDecisionApiClient'
import caseOverviewApiResponse from '../../api/responses/get-case-overview.json'
import caseRiskApiResponse from '../../api/responses/get-case-risk.json'
import caseLicenceHistoryApiResponse from '../../api/responses/get-case-licence-history.json'

jest.mock('../data/makeDecisionApiClient')

const crn = ' A1234AB '
let res: Response
const token = 'token'

describe('caseSummary', () => {
  beforeEach(() => {
    res = mockRes({ token })
  })

  it('should return case details for a valid CRN', async () => {
    ;(getCaseDetails as jest.Mock).mockReturnValueOnce(caseRiskApiResponse)
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummary(req, res)
    expect(getCaseDetails).toHaveBeenCalledWith(crn.trim(), 'risk', token)
    expect(res.render).toHaveBeenCalledWith('pages/caseSummary')
    expect(res.locals.case).toEqual(caseRiskApiResponse)
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })

  it('should return index offences for overview', async () => {
    ;(getCaseDetails as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    const req = mockReq({ params: { crn, sectionId: 'overview' } })
    await caseSummary(req, res)
    expect(getCaseDetails).toHaveBeenCalledWith(crn.trim(), 'overview', token)
    expect(res.locals.case).toEqual({
      ...caseOverviewApiResponse,
      indexOffences: [
        {
          description: 'Robbery (other than armed robbery)',
          mainOffence: true,
        },
      ],
    })
    expect(res.locals.section).toEqual({
      id: 'overview',
      label: 'Overview',
    })
  })

  it('should return empty indexOffences array if case has no offences', async () => {
    ;(getCaseDetails as jest.Mock).mockReturnValueOnce({ ...caseOverviewApiResponse, offences: undefined })
    const req = mockReq({ params: { crn, sectionId: 'overview' } })
    await caseSummary(req, res)
    expect(res.locals.case.indexOffences).toEqual([])
  })

  it('should return sorted dates for licence history', async () => {
    ;(getCaseDetails as jest.Mock).mockReturnValueOnce(caseLicenceHistoryApiResponse)
    const req = mockReq({ params: { crn, sectionId: 'licence-history' } })
    await caseSummary(req, res)
    expect(getCaseDetails).toHaveBeenCalledWith(crn.trim(), 'licence-history', token)
    expect(res.locals.case).toEqual({
      ...caseLicenceHistoryApiResponse,
      contactSummary: [
        {
          contactStartDate: '2022-06-03T08:00:00',
          descriptionType: 'Registration Review',
          outcome: null,
          notes:
            'Comment added by John Smith on 05/05/2022 at 17:45\nType: Public Protection - MAPPA\nLevel: MAPPA Level 3\nCategory: MAPPA Cat 3\nNotes: Please Note - Category 3 offenders require multi-agency management at Level 2 or 3 and should not be recorded at Level 1.',
        },
        {
          contactStartDate: '2022-05-10T11:39:00',
          descriptionType: 'Police Liaison',
          outcome: null,
          notes: null,
        },
      ],
    })
    expect(res.locals.section).toEqual({
      id: 'licence-history',
      label: 'Licence history',
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
    ;(getCaseDetails as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
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
