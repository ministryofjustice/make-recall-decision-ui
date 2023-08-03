import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { personSearchResults } from './personSearchResults'
import { searchPersons, getPersonsByCrn } from '../../data/makeDecisionApiClient'
import { AuditService } from '../../services/auditService'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

const crn = ' A1234AB '
let res: Response
const token = 'token'
const featureFlags = {}

describe('personSearchResults', () => {
  beforeEach(() => {
    res = mockRes({
      token,
      locals: { user: { username: 'Dave', region: { code: 'N07', name: 'London' } }, flags: featureFlags },
    })
  })

  it('should return results for a valid CRN', async () => {
    const persons = [
      {
        name: 'Paula Smith',
        crn,
        dateOfBirth: '1990-10-30',
      },
    ]
    ;(getPersonsByCrn as jest.Mock).mockReturnValueOnce(persons)
    const req = mockReq({ query: { crn } })
    await personSearchResults(req, res)
    expect(getPersonsByCrn).toHaveBeenCalledWith(crn.trim(), token)
    expect(res.render).toHaveBeenCalledWith('pages/personSearchResults')
    expect(res.locals.persons).toEqual(persons)
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdPersonSearchResults',
      'Dave',
      {
        crn: 'A1234AB',
        region: { code: 'N07', name: 'London' },
      },
      featureFlags
    )
  })

  it('should return an error if no search query submitted', async () => {
    const invalidCrn = 50 as unknown as string
    const req = mockReq({ query: { crn: invalidCrn } })
    await personSearchResults(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, '/search-by-crn')
    expect(req.session.errors).toEqual([
      {
        href: '#crn',
        name: 'crn',
        text: 'Enter a Case Reference Number (CRN) in the correct format, for example X123456',
        errorId: 'invalidCrnFormat',
      },
    ])
    expect(req.session.unsavedValues).toEqual({ crn: 50 })
  })

  it('should throw if the search API call errors', async () => {
    const apiError = { status: 500 }
    ;(getPersonsByCrn as jest.Mock).mockRejectedValue(apiError)
    const req = mockReq({ query: { crn } })
    try {
      await personSearchResults(req, res)
    } catch (err) {
      expect(err).toEqual(apiError)
    }
  })

  it('should send an audit event', async () => {
    ;(getPersonsByCrn as jest.Mock).mockReturnValueOnce([])
    const req = mockReq({ query: { crn: '123' } })
    jest.spyOn(AuditService.prototype, 'personSearch')
    await personSearchResults(req, res)
    expect(AuditService.prototype.personSearch).toHaveBeenCalledWith({
      searchTerm: { crn: '123' },
      username: 'Dave',
      logErrors: true,
    })
  })

  const TEMPLATE = {
    results: [
      {
        name: 'Harry 1 Smith',
        crn: 'X098092',
        dateOfBirth: '1980-05-06',
        userExcluded: false,
        userRestricted: false,
      },
    ],
    paging: { page: 0, pageSize: 10, totalNumberOfPages: 1 },
  }

  it('valid search with flag', async () => {
    ;(searchPersons as jest.Mock).mockReturnValueOnce(TEMPLATE)
    jest.spyOn(AuditService.prototype, 'personSearch')
    const req = mockReq({
      query: {
        crn: 'A123',
        page: '1',
      },
    })

    res = mockRes({
      locals: { user: { username: 'Dave' }, flags: { flagSearchByName: true } },
    })

    await personSearchResults(req, res)
    expect(searchPersons).toHaveBeenCalledWith('token', 0, 20, 'A123', undefined, undefined)
    expect(res.render).toHaveBeenCalledWith('pages/paginatedPersonSearchResults')
    expect(res.locals.page).toEqual(TEMPLATE)

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdPersonSearchResults',
      'Dave',
      {
        crn: 'A123',
      },
      { flagSearchByName: true }
    )

    expect(AuditService.prototype.personSearch).toHaveBeenCalledWith({
      searchTerm: { crn: 'A123' },
      username: 'Dave',
      logErrors: true,
    })
  })
})
