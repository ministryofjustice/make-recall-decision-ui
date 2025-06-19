import { faker } from '@faker-js/faker/locale/en_GB'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import sentenceToCommitIndeterminateController from './sentenceToCommitIndeterminateController'
import { formatPpudSentenceLength } from '../../../../utils/dates/format/formatPpudSentenceLength'

jest.mock('../../../../utils/dates/format/formatPpudSentenceLength')

const releaseDate = faker.date.future()
const expected = {
  sentence: {
    id: faker.helpers.replaceSymbols('********************'),
    custodyType: faker.helpers.arrayElement(['IPP', 'DPP']), // Are we introducing a source for these?
    indexOffence: faker.lorem.words(),
    releaseDate: releaseDate.toISOString(),
    sentencingCourt: `${faker.location.city} Court`,
    dateOfSentence: faker.date.past().toISOString(),
    sentenceExpiryDate: faker.date.future({ refDate: releaseDate }).toISOString(),
    fullPunishmentYears: faker.number.int({ min: 1, max: 5 }),
    fullPunishmentMonths: faker.number.int({ min: 1, max: 11 }),
    fullPunishmentDays: faker.number.int({ min: 1, max: 30 }),
  },
  render: {
    path: 'pages/recommendations/ppcs/sentenceToCommit/sentenceToCommitIndeterminate',
  },
}

describe('Sentence to Commit Indeterminate Controller', () => {
  describe('get', () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: {
            ppudSentenceId: expected.sentence.id,
          },
          ppudOffender: {
            sentences: [
              {
                id: expected.sentence.id,
                custodyType: expected.sentence.custodyType,
                offence: {
                  indexOffence: expected.sentence.indexOffence,
                },
                releaseDate: expected.sentence.releaseDate,
                sentencingCourt: expected.sentence.sentencingCourt,
                dateOfSentence: expected.sentence.dateOfSentence,
                sentenceExpiryDate: expected.sentence.sentenceExpiryDate,
                sentenceLength: {
                  partYears: expected.sentence.fullPunishmentYears,
                  partMonths: expected.sentence.fullPunishmentMonths,
                  partDays: expected.sentence.fullPunishmentDays,
                },
              },
            ],
          },
        },
      },
    })
    const next = mockNext()
    const sentenceLengthDisplay = faker.string.alphanumeric()

    beforeEach(async () => {
      ;(formatPpudSentenceLength as jest.Mock).mockReturnValueOnce(sentenceLengthDisplay)
      await sentenceToCommitIndeterminateController.get(mockReq(), res, next)
    })

    it('Sets the correct page id', async () => expect(res.locals.page.id).toEqual('sentenceToCommitIndeterminate'))
    it('Sets the correct details for the sentence summary', async () => {
      expect(res.locals.sentenceSummary).toEqual({
        custodyType: expected.sentence.custodyType,
        offence: expected.sentence.indexOffence,
        releaseDate: expected.sentence.releaseDate,
        sentencingCourt: expected.sentence.sentencingCourt,
        dateOfSentence: expected.sentence.dateOfSentence,
        tariffExpiryDate: expected.sentence.sentenceExpiryDate,
        fullPunishment: sentenceLengthDisplay,
      })

      expect(formatPpudSentenceLength).toHaveBeenCalledWith(
        res.locals.recommendation.ppudOffender.sentences[0].sentenceLength
      )
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
