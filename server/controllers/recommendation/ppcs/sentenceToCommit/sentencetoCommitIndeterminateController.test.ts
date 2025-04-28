import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import sentenceToCommitIndeterminateController from './sentenceToCommitIndeterminateController'

type Expected = { [key: string]: { [key: string]: string } }
const releaseDate = faker.date.future()
const expected: Expected = {
  recommendation: {
    custoryType: faker.helpers.arrayElement(['IPP', 'DPP']), // Are we introducing a source for these?
    indexOffence: faker.lorem.sentence(),
  },
  offeredOffence: {
    chargeId: faker.number.int().toString(),
    releaseDate: releaseDate.toISOString(),
    courtDescription: `${faker.location.city} Court`,
    sentenceDate: faker.date.past().toISOString(),
    sentenceEndDate: faker.date.future({ refDate: releaseDate }).toISOString(),
  },
  render: {
    path: 'pages/recommendations/ppcs/sentenceToCommit/sentenceToCommitIndeterminate',
  },
}

describe('Sentence to Commit Indeterminate Controler', () => {
  describe('get', () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            custodyType: expected.recommendation.custodyType,
            indexOffence: expected.recommendation.indexOffence,
          },
          nomisIndexOffence: {
            selected: expected.offeredOffence.chargeId,
            allOptions: [
              {
                offenderChargeId: expected.offeredOffence.chargeId,
                releaseDate: expected.offeredOffence.releaseDate,
                courtDescription: expected.offeredOffence.courtDescription,
                sentenceDate: expected.offeredOffence.sentenceDate,
                sentenceEndDate: expected.offeredOffence.sentenceEndDate,
              },
            ],
          },
        },
      },
    })
    const next = mockNext()

    beforeEach(async () => {
      await sentenceToCommitIndeterminateController.get(mockReq(), res, next)
    })

    it('Sets the correct page id', async () => expect(res.locals.page.id).toEqual('sentenceToCommitIndeterminate'))
    it('Sets the correct details for the sentence summary', async () => {
      expect(res.locals.sentenceSummary).toEqual({
        custodyType: expected.recommendation.custodyType,
        offence: expected.recommendation.indexOffence,
        releaseDate: expected.offeredOffence.releaseDate,
        sentencingCourt: expected.offeredOffence.courtDescription,
        dateOfSentence: expected.offeredOffence.sentenceDate,
        tarrifExpiryDate: expected.offeredOffence.sentenceEndDate,
      })
    })
    it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
    it('Calls render to for the expected page', async () =>
      expect(res.render).toHaveBeenCalledWith(expected.render.path))
    it('Executes the next function', async () => expect(next).toHaveBeenCalled())
  })

  describe('post', () => {
    const basePath = `/recommendations/${faker.number.int()}/`
    const res = mockRes({
      locals: {
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    beforeEach(async () => {
      await sentenceToCommitIndeterminateController.post(mockReq(), res, next)
    })

    it('Redirects to the book to ppud page', async () =>
      expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}book-to-ppud`))
    it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
  })
})
