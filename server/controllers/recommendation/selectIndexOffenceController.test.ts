import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { prisonSentences } from '../../data/makeDecisionApiClient'
import selectIndexOffenceController from './selectIndexOffenceController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(prisonSentences as jest.Mock).mockResolvedValue([
      {
        bookingId: 13,
      },
    ])

    const res = mockRes({
      locals: {
        recommendation: {
          id: '123',
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: '567Y',
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
            mappa: {
              level: '1',
            },
          },
        },
      },
    })
    const next = mockNext()

    await selectIndexOffenceController.get(mockReq(), res, next)

    expect(prisonSentences).toHaveBeenCalledWith('token', '567Y')
    expect(res.locals.page.id).toEqual('selectIndexOffence')
    expect(res.locals.sentences).toEqual([
      {
        bookingId: 13,
      },
    ])
    expect(res.locals.errorMessage).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/selectIndexOffence`)
    expect(next).toHaveBeenCalled()
  })
  it('load with no sentences', async () => {
    ;(prisonSentences as jest.Mock).mockResolvedValue([])

    const res = mockRes({
      locals: {
        recommendation: {
          id: '123',
          personOnProbation: {
            nomsNumber: '567Y',
          },
        },
      },
    })
    const next = mockNext()

    await selectIndexOffenceController.get(mockReq(), res, next)

    expect(prisonSentences).toHaveBeenCalledWith('token', '567Y')
    expect(res.locals.page.id).toEqual('selectIndexOffence')
    expect(res.locals.sentences).toEqual([])
    expect(res.locals.errorMessage).toBe('No sentences found')
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/selectIndexOffence`)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('select index offence', async () => {
    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await selectIndexOffenceController.post(mockReq(), res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/map-index-offence`)

    expect(next).toHaveBeenCalled()
  })
})
