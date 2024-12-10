import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import sentenceToCommitExistingOffenderController from './sentenceToCommitExistingOffenderController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load - with existing ppud user and selected sentence', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            ppudSentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
          },
          nomisIndexOffence: {
            allOptions: [
              {
                offenderChargeId: 3934369,
              },
            ],
            selected: 3934369,
          },
          ppudOffender: {
            sentences: [
              {
                id: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
                releaseDate: '2024-01-01',
              },
              {
                id: '4F6666656E64657249643D3136323931342653656E74656E636549643D313238393334G1375H1387',
                releaseDate: '2028-01-01',
              },
            ],
          },
        },
      },
    })
    const next = mockNext()

    await sentenceToCommitExistingOffenderController.get(mockReq(), res, next)

    expect(res.locals.page.id).toEqual('sentenceToCommitExistingOffender')
    expect(res.locals.offence).toEqual({
      offenderChargeId: 3934369,
    })
    expect(res.locals.ppudSentence).toEqual({
      id: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
      releaseDate: '2024-01-01',
    })
    expect(res.locals.errorMessage).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/sentenceToCommitExistingOffender`)
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

    await sentenceToCommitExistingOffenderController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/book-to-ppud`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
