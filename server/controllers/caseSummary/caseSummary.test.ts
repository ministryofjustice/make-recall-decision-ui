import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { caseSummary } from './caseSummary'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import * as redisExports from '../../data/redisClient'
import caseOverviewApiResponse from '../../../api/responses/get-case-overview.json'
import caseRiskApiResponse from '../../../api/responses/get-case-risk.json'
import caseLicenceConditionsResponse from '../../../api/responses/get-case-licence-conditions.json'
import casePersonalDetailsResponse from '../../../api/responses/get-case-personal-details.json'
import excludedResponse from '../../../api/responses/get-case-excluded.json'
import restrictedResponse from '../../../api/responses/get-case-restricted.json'

jest.mock('../../data/makeDecisionApiClient')

const crn = ' A1234AB '
let res: Response
const token = 'token'

describe('caseSummary', () => {
  beforeEach(() => {
    res = mockRes({ token })
  })

  it('should return case details for risk', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseRiskApiResponse)
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummary(req, res)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'risk', token)
    expect(res.render).toHaveBeenCalledWith('pages/caseSummary')
    expect(res.locals.caseSummary).toEqual(caseRiskApiResponse)
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })

  it('should return case details for overview', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    const req = mockReq({ params: { crn, sectionId: 'overview' } })
    await caseSummary(req, res)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'overview', token)
    expect(res.locals.caseSummary).toEqual(caseOverviewApiResponse)
    expect(res.locals.section).toEqual({
      id: 'overview',
      label: 'Overview',
    })
  })

  it('should return case details for licence conditions', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseLicenceConditionsResponse)
    const req = mockReq({ params: { crn, sectionId: 'licence-conditions' } })
    await caseSummary(req, res)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'licence-conditions', token)
    expect(res.locals.caseSummary.convictions).toHaveLength(2)
    expect(res.locals.section).toEqual({
      id: 'licence-conditions',
      label: 'Licence conditions',
    })
  })

  it('should return case details for personal details', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(casePersonalDetailsResponse)
    const req = mockReq({ params: { crn, sectionId: 'personal-details' } })
    await caseSummary(req, res)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'personal-details', token)
    expect(res.locals.caseSummary).toEqual(casePersonalDetailsResponse)
    expect(res.locals.section).toEqual({
      id: 'personal-details',
      label: 'Personal details',
    })
  })

  it('should convert the CRN to uppercase', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    const req = mockReq({ params: { crn: 'abc', sectionId: 'overview' } })
    await caseSummary(req, res)
    expect(getCaseSummary).toHaveBeenCalledWith('ABC', 'overview', token)
  })

  it('should return grouped by dates for contact history', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce({
      contactTypeGroups: [
        {
          groupId: '1',
          label: 'Accredited programme',
          contactTypeCodes: ['C191', 'IVSP'],
        },
      ],
      contactSummary: [
        {
          code: 'C191',
          contactStartDate: '2022-06-03T08:00:00',
          descriptionType: 'Registration Review',
          outcome: null,
          notes:
            'Comment added by John Smith on 05/05/2022 at 17:45\nType: Public Protection - MAPPA\nLevel: MAPPA Level 3\nCategory: MAPPA Cat 3\nNotes: Please Note - Category 3 offenders require multi-agency management at Level 2 or 3 and should not be recorded at Level 1.',
          enforcementAction: 'action 2',
          systemGenerated: false,
        },
        {
          code: 'IVSP',
          contactStartDate: '2022-05-10T11:39:00',
          descriptionType: 'Police Liaison',
          outcome: null,
          notes: null,
          enforcementAction: 'action 1',
          systemGenerated: false,
        },
      ],
    })
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    const req = mockReq({ params: { crn, sectionId: 'contact-history' } })
    await caseSummary(req, res)
    expect(getCaseSummary).toHaveBeenCalledWith(crn.trim(), 'contact-history', token)
    expect(res.locals.caseSummary.contactSummary).toEqual({
      groupedByKey: 'startDate',
      items: [
        {
          groupValue: '2022-06-03',
          items: [
            {
              code: 'C191',
              contactStartDate: '2022-06-03T08:00:00',
              descriptionType: 'Registration Review',
              enforcementAction: 'action 2',
              notes:
                'Comment added by John Smith on 05/05/2022 at 17:45\nType: Public Protection - MAPPA\nLevel: MAPPA Level 3\nCategory: MAPPA Cat 3\nNotes: Please Note - Category 3 offenders require multi-agency management at Level 2 or 3 and should not be recorded at Level 1.',
              outcome: null,
              startDate: '2022-06-03',
              systemGenerated: false,
            },
          ],
        },
        {
          groupValue: '2022-05-10',
          items: [
            {
              code: 'IVSP',
              contactStartDate: '2022-05-10T11:39:00',
              descriptionType: 'Police Liaison',
              enforcementAction: 'action 1',
              notes: null,
              outcome: null,
              startDate: '2022-05-10',
              systemGenerated: false,
            },
          ],
        },
      ],
    })
    expect(res.locals.section).toEqual({
      id: 'contact-history',
      label: '2 contacts for A1234AB - Contact history',
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
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(caseOverviewApiResponse)
    const req = mockReq({ params: { crn, sectionId: invalidSection } })
    try {
      await caseSummary(req, res)
    } catch (err) {
      expect(err.message).toEqual('getCaseSection: invalid sectionId: recalls')
      expect(err.status).toEqual(404)
    }
  })

  it('should throw if the API call errors', async () => {
    const apiError = { status: 500 }
    ;(getCaseSummary as jest.Mock).mockRejectedValue(apiError)
    const req = mockReq({ query: { crn } })
    try {
      await caseSummary(req, res)
    } catch (err) {
      expect(err).toEqual(apiError)
    }
  })

  it('should render an excluded CRN', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(excludedResponse)
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummary(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/excludedRestrictedCrn')
    expect(res.locals.caseSummary).toEqual(excludedResponse)
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })

  it('should render a restricted CRN', async () => {
    ;(getCaseSummary as jest.Mock).mockReturnValueOnce(restrictedResponse)
    const req = mockReq({ params: { crn, sectionId: 'risk' } })
    await caseSummary(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/excludedRestrictedCrn')
    expect(res.locals.caseSummary).toEqual(restrictedResponse)
    expect(res.locals.section).toEqual({
      id: 'risk',
      label: 'Risk',
    })
  })
})
