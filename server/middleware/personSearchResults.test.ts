import { Response } from 'express'
import { mockReq, mockRes } from './testutils/mockRequestUtils'
import { personSearchResults } from './personSearchResults'
import { getPersonsByCrn } from '../data/makeDecisionApiClient'

jest.mock('../data/makeDecisionApiClient')

const crn = ' A1234AB '
let res: Response
const token = 'token'

describe('personSearchResults', () => {
  beforeEach(() => {
    res = mockRes({ token })
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

  it('should return 400 if invalid search query submitted', async () => {
    const invalidCrn = 50 as unknown as string
    const req = mockReq({ query: { crn: invalidCrn } })
    await personSearchResults(req, res)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
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
})
