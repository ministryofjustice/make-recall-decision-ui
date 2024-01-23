import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import indexOffenceSelectedController from './indexOffenceSelectedController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          nomisIndexOffence: {
            allOptions: [
              {
                bookingId: 13,
                courtDescription: 'Blackburn County Court',
                offenceCode: 'SA96036',
                offenceDescription:
                  'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
                offenceStatute: 'SA96',
                offenderChargeId: 3934369,
                sentenceDate: '2023-11-16',
                sentenceEndDate: '3022-11-15',
                sentenceStartDate: '2023-11-16',
                sentenceTypeDescription: 'Adult Mandatory Life',
                terms: [],
                releaseDate: '2025-11-16',
                licenceExpiryDate: '2025-11-17',
                releasingPrison: 'Broad Moor',
              },
            ],
            selected: 3934369,
          },
        },
      },
    })
    const next = mockNext()

    await indexOffenceSelectedController.get(mockReq(), res, next)

    expect(res.locals.page.id).toEqual('indexOffenceSelected')
    expect(res.locals.offence).toEqual({
      bookingId: 13,
      courtDescription: 'Blackburn County Court',
      offenceCode: 'SA96036',
      offenceDescription:
        'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
      offenceStatute: 'SA96',
      offenderChargeId: 3934369,
      sentenceDate: '2023-11-16',
      sentenceEndDate: '3022-11-15',
      sentenceStartDate: '2023-11-16',
      sentenceTypeDescription: 'Adult Mandatory Life',
      terms: [],
      releaseDate: '2025-11-16',
      licenceExpiryDate: '2025-11-17',
      releasingPrison: 'Broad Moor',
    })
    expect(res.locals.errorMessage).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/indexOffenceSelected`)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post', async () => {
    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await indexOffenceSelectedController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/book-to-ppud`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
