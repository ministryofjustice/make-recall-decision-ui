import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { personSearchResults } from './personSearchResults'
import { getPersonsByCrn } from '../../data/makeDecisionApiClient'
import { AuditService } from '../../services/auditService'

jest.mock('../../data/makeDecisionApiClient')

const crn = ' A1234AB '
let res: Response
const token = 'token'

describe('personSearchResults', () => {
  beforeEach(() => {
    res = mockRes({ token, locals: { user: { username: 'Dave' } } })
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
  })

  it('should return an error if no search query submitted', async () => {
    const invalidCrn = 50 as unknown as string
    const req = mockReq({ query: { crn: invalidCrn } })
    await personSearchResults(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, '/search')
    expect(req.session.errors).toEqual([
      {
        href: '#crn',
        name: 'crn',
        text: 'Enter a Case Reference Number (CRN) in the correct format, for example X12345',
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
      searchTerm: '123',
      username: 'Dave',
      logErrors: true,
    })
  })
})
