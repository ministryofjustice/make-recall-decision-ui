import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { searchPpud } from '../../data/makeDecisionApiClient'
import searchPpudController from './searchPpudResultsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(searchPpud as jest.Mock).mockResolvedValue({
      results: [
        {
          id: '4F6666656E64657269643D313731383138G725H664',
          croNumber: '123456/12A',
          nomsId: 'JG123POE',
          firstNames: 'John',
          familyName: 'Teal',
          dateOfBirth: '2000-01-01',
        },
      ],
    })

    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: '567Y',
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await searchPpudController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'searchPpudResults' })
    expect(res.locals.ppud).toEqual({
      id: '4F6666656E64657269643D313731383138G725H664',
      croNumber: '123456/12A',
      nomsId: 'JG123POE',
      firstNames: 'John',
      familyName: 'Teal',
      dateOfBirth: '2000-01-01',
    })

    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('book in ppud', async () => {
    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await searchPpudController.post(mockReq(), res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/check-booking-details`)

    expect(next).toHaveBeenCalled()
  })
})
