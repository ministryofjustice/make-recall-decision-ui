import CUSTODY_GROUP from '../../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import sentenceToCommitExistingOffenderController from './sentenceToCommitExistingOffenderController'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import { getSupportingDocuments } from '../../../../data/makeDecisionApiClient'

jest.mock('../../../../data/makeDecisionApiClient')

describe('get', () => {
  beforeEach(() => {
    ;(getSupportingDocuments as jest.Mock).mockResolvedValue([{ filename: 'Part-A.doc', type: 'PPUDPartA' }])
  })

  it('load - with existing ppud user and selected sentence', async () => {
    const recommendation = RecommendationResponseGenerator.generate()
    const selectedPpudSentence = recommendation.ppudOffender.sentences[0]
    recommendation.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id
    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()

    await sentenceToCommitExistingOffenderController.get(mockReq(), res, next)

    expect(res.locals.page.id).toEqual('sentenceToCommitExistingOffender')
    const selectedIndexOffence = recommendation.nomisIndexOffence.allOptions.find(
      offence => offence.offenderChargeId === recommendation.nomisIndexOffence.selected,
    )
    expect(res.locals.offence).toEqual(selectedIndexOffence)
    expect(res.locals.ppudSentence).toEqual(selectedPpudSentence)
    expect(res.locals.documents).toEqual([{ filename: 'Part-A.doc', type: 'PPUDPartA' }])
    expect(res.locals.errorMessage).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith(
      `pages/recommendations/ppcs/sentenceToCommit/sentenceToCommitExistingOffender`,
    )
    expect(next).toHaveBeenCalled()
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
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            totalSentenceLength,
            ppudSentenceId: 'sentence-1',
          },
          ppudOffender: { sentences: [{ id: 'sentence-1' }] },
        },
      },
    })

  it('is set when the selected offence is part of a consecutive sequence', async () => {
    const res = buildRes(2)
    await sentenceToCommitExistingOffenderController.get(mockReq(), res, mockNext())
    expect(res.locals.totalSentenceLength).toEqual(totalSentenceLength)
  })
  it('is not set when the selected offence has no consecutive sentences', async () => {
    const res = buildRes(undefined)
    await sentenceToCommitExistingOffenderController.get(mockReq(), res, mockNext())
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

    await sentenceToCommitExistingOffenderController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/book-to-ppud`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
