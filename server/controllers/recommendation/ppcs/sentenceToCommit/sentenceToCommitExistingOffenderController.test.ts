import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import sentenceToCommitExistingOffenderController from './sentenceToCommitExistingOffenderController'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'

jest.mock('../../../../data/makeDecisionApiClient')

describe('get', () => {
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
      offence => offence.offenderChargeId === recommendation.nomisIndexOffence.selected
    )
    expect(res.locals.offence).toEqual(selectedIndexOffence)
    expect(res.locals.ppudSentence).toEqual(selectedPpudSentence)
    expect(res.locals.errorMessage).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith(
      `pages/recommendations/ppcs/sentenceToCommit/sentenceToCommitExistingOffender`
    )
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
