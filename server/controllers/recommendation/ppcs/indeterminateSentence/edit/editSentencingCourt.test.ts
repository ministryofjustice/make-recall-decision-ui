import { fakerEN_GB as faker } from '@faker-js/faker/'
import { mockNext, mockReq, mockRes } from '../../../../../middleware/testutils/mockRequestUtils'
import { ppudReferenceList, updateRecommendation } from '../../../../../data/makeDecisionApiClient'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import editSentencingCourt from './editSentencingCourt'

jest.mock('../../../../../data/makeDecisionApiClient')

const expected = {
  basePath: `/recommendations/${faker.number.int()}/`,
  render: {
    path: 'pages/recommendations/ppcs/indeterminateSentence/edit/editSentencingCourt',
  },
}

describe('Indeterminate Sentence - Edit sentencing court controller', () => {
  const sentenceId = faker.number.int().toString()
  const originalSentencingCourt = `${faker.location.city()} Court`
  const recommendation = RecommendationResponseGenerator.generate({
    bookRecallToPpud: {
      ppudSentenceId: sentenceId,
      ppudIndeterminateSentenceData: {},
    },
    ppudOffender: {
      sentences: [
        {
          id: sentenceId,
          sentencingCourt: originalSentencingCourt,
        },
      ],
    },
  })
  const updatedSentencingCourt = `${faker.location.city()} Court`

  describe('get', () => {
    const req = mockReq()
    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    beforeEach(async () => {
      ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: ['one', 'two', 'three'] })
      await editSentencingCourt.get(req, res, next)
    })
    it('Sets response locals correctly', async () => {
      expect(res.locals.existingSentencingCourt).toBeDefined()
      expect(res.locals.allCourts).toEqual([
        {
          text: 'one',
          value: 'one',
        },
        {
          text: 'two',
          value: 'two',
        },
        {
          text: 'three',
          value: 'three',
        },
      ])
    })

    it('Does not set any error message', async () => expect(res.locals.errorMessage).toBeUndefined())
    it('Calls render for the expected page', async () => expect(res.render).toHaveBeenCalledWith(expected.render.path))
    it('Executes the next function ', async () => expect(next).toHaveBeenCalled())
  })

  describe('post', () => {
    const recommendationId = faker.number.int().toString()
    const basePath = `/recommendations/${recommendationId}/`
    const next = mockNext()

    const validReq = mockReq({
      params: { recommendationId },
      body: {
        sentencingCourt: updatedSentencingCourt,
      },
    })

    const validReqWithComment = mockReq({
      params: { recommendationId },
      body: {
        sentencingCourt: updatedSentencingCourt,
      },
    })

    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath },
      },
    })

    describe('Given a valid sentencing court is submitted', () => {
      beforeEach(async () => {
        await editSentencingCourt.post(validReq, res, next)
      })
      it('Then there are no errors', async () => expect(validReq.session.errors).toBeUndefined())
      it('Then the recommendation is updated with the expected details', async () =>
        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId,
          valuesToSave: {
            bookRecallToPpud: {
              ...recommendation.bookRecallToPpud,
              ppudIndeterminateSentenceData: {
                ...recommendation.bookRecallToPpud.ppudIndeterminateSentenceData,
                sentencingCourt: updatedSentencingCourt,
              },
            },
          },
          featureFlags: res.locals.flags,
          token: res.locals.user.token,
        }))
      it('Then it redirects to the Sentence to Commit (Indeterminate page)', async () =>
        expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}sentence-to-commit-indeterminate`))
      it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
    })
    describe('Given a valid sentencing court is submitted', () => {
      beforeEach(async () => {
        await editSentencingCourt.post(validReqWithComment, res, next)
      })
      it('Then there are no errors', async () => expect(validReq.session.errors).toBeUndefined())
      it('Then the recommendation is updated with the expected details', async () =>
        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId,
          valuesToSave: {
            bookRecallToPpud: {
              ...recommendation.bookRecallToPpud,
              ppudIndeterminateSentenceData: {
                ...recommendation.bookRecallToPpud.ppudIndeterminateSentenceData,
                sentencingCourt: updatedSentencingCourt,
              },
            },
          },
          featureFlags: res.locals.flags,
          token: res.locals.user.token,
        }))
      it('Then it redirects to the Sentence to Commit (Indeterminate page)', async () =>
        expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}sentence-to-commit-indeterminate`))
      it('Does not execute the next function ', async () => expect(next).not.toHaveBeenCalled())
    })
    describe('Given no sentencing court has been selected', () => {
      const invalidReq = mockReq({
        body: {
          updatedSentencingCourt: null,
        },
        originalUrl: faker.internet.url(),
      })
      beforeEach(async () => {
        await editSentencingCourt.post(invalidReq, res, next)
      })
      it('Then there is an error', async () => {
        expect(invalidReq.session.errors).toBeDefined()
      })
      describe('Error details', () => {
        const sentencingCourtName = 'sentencingCourt'
        it(`- Contains an error for ${sentencingCourtName}`, async () => {
          expect(invalidReq.session.errors?.some(e => e.name === sentencingCourtName)).toBeTruthy()
          const getError = () => invalidReq.session.errors.find(e => e.name === sentencingCourtName)
          expect(getError().text).toBeDefined()
          expect(res.redirect).toHaveBeenCalledWith(303, invalidReq.originalUrl)
          expect(updateRecommendation).not.toHaveBeenCalled()
        })
      })
    })
  })
})
