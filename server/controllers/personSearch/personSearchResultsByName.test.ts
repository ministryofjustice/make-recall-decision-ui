import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { searchPersons } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { personSearchResultsByName } from './personSearchResultsByName'
import { AuditService } from '../../services/auditService'
import { routeUrls } from '../../routes/routeUrls'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

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

describe('personSearchResultsByName', () => {
  it('valid search', async () => {
    ;(searchPersons as jest.Mock).mockReturnValueOnce(TEMPLATE)
    jest.spyOn(AuditService.prototype, 'personSearch')
    const req = mockReq({
      query: {
        lastName: 'Styles',
        firstName: 'Harry',
        page: '1',
      },
    })

    const res = mockRes({
      locals: { user: { username: 'Dave', region: { code: 'N07', name: 'London' } }, flags: {} },
    })

    await personSearchResultsByName(req, res)
    expect(searchPersons).toHaveBeenCalledWith('token', 0, 20, undefined, 'Harry', 'Styles')
    expect(res.render).toHaveBeenCalledWith('pages/paginatedPersonSearchResults')
    expect(res.locals.page).toEqual(TEMPLATE)

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdPersonSearchResults',
      'Dave',
      {
        firstName: 'Harry',
        lastName: 'Styles',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )

    expect(AuditService.prototype.personSearch).toHaveBeenCalledWith({
      searchTerm: { firstName: 'Harry', lastName: 'Styles' },
      username: 'Dave',
      logErrors: true,
    })
  })

  it('invalid search for firstName', async () => {
    const req = mockReq({
      query: {
        lastName: 'Zero0',
        firstName: 'Harry',
        page: '1',
      },
    })

    const res = mockRes({
      locals: { user: { username: 'Dave' }, flags: {} },
    })

    await personSearchResultsByName(req, res)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingLastName',
        href: '#lastName',
        name: 'lastName',
        text: 'Enter a last name',
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      firstName: 'Harry',
      lastName: 'Zero0',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, routeUrls.searchByName)
  })

  it('invalid search for lastName', async () => {
    const req = mockReq({
      query: {
        lastName: "Zero-'",
        firstName: 'Harry1',
        page: '1',
      },
    })

    const res = mockRes({
      locals: { user: { username: 'Dave' }, flags: {} },
    })

    await personSearchResultsByName(req, res)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingFirstName',
        href: '#firstName',
        name: 'firstName',
        text: 'Enter a first name',
      },
    ])
    expect(req.session.unsavedValues).toEqual({
      firstName: 'Harry1',
      lastName: "Zero-'",
    })
    expect(res.redirect).toHaveBeenCalledWith(303, routeUrls.searchByName)
  })
})
