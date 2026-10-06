import CUSTODY_GROUP from '../../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import sentenceToCommitController from './sentenceToCommitController'
import { getSupportingDocuments } from '../../../../data/makeDecisionApiClient'

jest.mock('../../../../data/makeDecisionApiClient')

describe('get', () => {
  beforeEach(() => {
    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([{ filename: 'Part-A.doc', type: 'PPUDPartA' }])
  })

  it('load - with no ppud offender', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '123',
          nomisIndexOffence: {
            allOptions: [
              {
                bookingId: 13,
                courtDescription: 'Blackburn County Court',
                offenceCode: 'SA12345',
                offenceDescription: 'Attack / assault / batter a member of the public',
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

    await sentenceToCommitController.get(mockReq(), res, next)

    expect(res.locals.page.id).toEqual('sentenceToCommit')
    expect(res.locals.offence).toEqual({
      bookingId: 13,
      courtDescription: 'Blackburn County Court',
      offenceCode: 'SA12345',
      offenceDescription: 'Attack / assault / batter a member of the public',
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
    expect(res.locals.documents).toEqual([{ filename: 'Part-A.doc', type: 'PPUDPartA' }])
    expect(res.locals.errorMessage).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/ppcs/sentenceToCommit/sentenceToCommit`)
    expect(next).toHaveBeenCalled()
  })
  it('load - with add new sentence', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '456',
          ppudOffender: {},
          bookRecallToPpud: {
            ppudSentenceId: 'ADD_NEW',
          },
          nomisIndexOffence: {
            allOptions: [
              {
                offenderChargeId: 3934369,
              },
            ],
            selected: 3934369,
          },
        },
      },
    })
    const next = mockNext()

    await sentenceToCommitController.get(mockReq(), res, next)
  })
})

describe('get - total sentence length', () => {
  beforeEach(() => {
    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([])
  })
  const totalSentenceLength = { partYears: 2, partMonths: 1, partDays: 3 }
  const buildRes = (consecutiveCount: number | undefined) =>
    mockRes({
      locals: {
        recommendation: {
          id: '123',
          nomisIndexOffence: {
            allOptions: [{ offenderChargeId: 1, terms: [], consecutiveCount }],
            selected: 1,
          },
          bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.DETERMINATE, totalSentenceLength },
        },
      },
    })

  it('is set when the selected offence is part of a consecutive sequence', async () => {
    const res = buildRes(2)
    await sentenceToCommitController.get(mockReq(), res, mockNext())
    expect(res.locals.totalSentenceLength).toEqual(totalSentenceLength)
  })
  it('is not set when the selected offence has no consecutive sentences', async () => {
    const res = buildRes(undefined)
    await sentenceToCommitController.get(mockReq(), res, mockNext())
    expect(res.locals.totalSentenceLength).toBeUndefined()
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
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await sentenceToCommitController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/book-to-ppud`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
