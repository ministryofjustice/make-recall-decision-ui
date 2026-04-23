import { randomInt, randomUUID } from 'crypto'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import selectPpudSentenceController from './selectPpudSentenceController'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import ppcsPaths from '../../routes/paths/ppcs'
import { PpudDetailsSentence } from '../../@types/make-recall-decision-api/models/PpudDetailsResponse'
import { ppudDetailsSentence } from '../../@types/make-recall-decision-api/models/ppud/PpudDetailsResponse.testFactory'
import { getDeterminateSentences } from '../../helpers/ppudSentence/ppudSentenceHelper'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../helpers/ppudSentence/ppudSentenceHelper')

describe('Select Determinate PPUD Sentence Controller', () => {
  describe('get', () => {
    it('loads page with determinate sentences', async () => {
      const sentenceId = faker.number.int().toString()

      const recommendation = RecommendationResponseGenerator.generate({
        ppudOffender: {
          sentences: [
            {
              id: sentenceId,
              custodyType: 'IPP',
              offence: {
                indexOffence: faker.lorem.word(),
                indexOffenceComment: faker.lorem.sentence(),
              },
            },
            {
              id: faker.string.uuid(),
              custodyType: 'DPP',
              offence: {
                indexOffence: faker.lorem.word(),
                indexOffenceComment: faker.lorem.sentence(),
              },
            },
          ],
        },
      })

      const determinateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
      ;(getDeterminateSentences as jest.Mock).mockReturnValueOnce(determinateSentences)

      const res = mockRes({
        locals: {
          user: { token: randomUUID() },
          recommendation,
          flags: { flagFTR56Enabled: faker.datatype.boolean() },
        },
      })

      const req = mockReq({
        params: { recommendationId: randomInt(0, 10000).toString() },
      })

      const next = mockNext()

      await selectPpudSentenceController.get(req, res, next)

      expect(res.locals.page.id).toEqual('selectPpudSentence')
      expect(res.locals.determinateSentences).toEqual(determinateSentences)
      expect(res.locals.recommendation).toEqual(recommendation)

      expect(getDeterminateSentences).toHaveBeenCalledWith(recommendation.ppudOffender.sentences)
      expect(res.render).toHaveBeenCalledWith('pages/recommendations/selectPpudSentence')
      expect(next).toHaveBeenCalled()
    })

    it('sets locals and renders correctly', async () => {
      const sentenceId = faker.number.int().toString()

      const recommendation = RecommendationResponseGenerator.generate({
        ppudOffender: {
          sentences: [
            {
              id: sentenceId,
              custodyType: 'IPP',
              offence: {
                indexOffence: faker.lorem.word(),
                indexOffenceComment: faker.lorem.sentence(),
              },
            },
          ],
        },
      })

      const determinateSentences: PpudDetailsSentence[] = [ppudDetailsSentence()]
      ;(getDeterminateSentences as jest.Mock).mockReturnValueOnce(determinateSentences)

      const req = mockReq({
        params: { recommendationId: randomInt(0, 10000).toString() },
      })

      const res = mockRes({
        locals: {
          recommendation,
        },
      })

      const next = mockNext()

      await selectPpudSentenceController.get(req, res, next)

      expect(res.locals.page).toBeDefined()
      expect(res.locals.page.id).toEqual('selectPpudSentence')

      expect(res.locals.offence).toBeDefined()
      expect(res.locals.offence).toEqual(recommendation.nomisIndexOffence.allOptions[0])

      expect(res.render).toHaveBeenCalledWith('pages/recommendations/selectPpudSentence')
      expect(next).toHaveBeenCalled()
    })
  })

  describe('post', () => {
    describe('Valid data', () => {
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          indexOffence: 'include',
          indexOffenceComment: 'include',
        },
        ppudOffender: {
          sentences: [
            {
              id: faker.string.uuid(),
              custodyType: 'IPP',
              offence: {
                indexOffence: faker.lorem.word(),
                indexOffenceComment: faker.lorem.sentence(),
              },
            },
          ],
        },
      })

      const basePath = `/recommendations/123/`

      const res = mockRes({
        locals: {
          urlInfo: { basePath },
          user: { token: randomUUID() },
          flags: {},
        },
      })

      const next = mockNext()

      describe('Non-conditional logic:', () => {
        const req = mockReq({
          originalUrl: 'some-url',
          params: { recommendationId: '123' },
          body: {
            ppudSentenceId: faker.helpers.arrayElement(recommendation.ppudOffender.sentences).id,
          },
        })

        beforeEach(async () => {
          ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
          await selectPpudSentenceController.post(req, res, next)
        })

        it('calls next function', () => {
          expect(next).toHaveBeenCalled()
        })
      })

      describe('Conditional logic:', () => {
        describe('ADD_NEW selected', () => {
          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '123' },
            body: { ppudSentenceId: 'ADD_NEW' },
          })

          beforeEach(async () => {
            ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
            await selectPpudSentenceController.post(req, res, next)
          })

          it('updates recommendation with undefined custody type', () => {
            expect(updateRecommendation).toHaveBeenCalledWith({
              recommendationId: req.params.recommendationId,
              valuesToSave: {
                bookRecallToPpud: {
                  ...recommendation.bookRecallToPpud,
                  ppudSentenceId: 'ADD_NEW',
                  custodyType: undefined,
                  indexOffence: undefined,
                  indexOffenceComment: undefined,
                },
              },
              token: res.locals.user.token,
              featureFlags: res.locals.flags,
            })
          })

          it('redirects to Match Index Offence page', () => {
            expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppcsPaths.matchIndexOffence}`)
          })
        })

        describe('existing sentence selected', () => {
          const selectedSentence = recommendation.ppudOffender.sentences[0]

          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '123' },
            body: { ppudSentenceId: selectedSentence.id },
          })

          beforeEach(async () => {
            ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
            await selectPpudSentenceController.post(req, res, next)
          })

          it('updates recommendation with selected custody type and offence', () => {
            expect(updateRecommendation).toHaveBeenCalledWith({
              recommendationId: req.params.recommendationId,
              valuesToSave: {
                bookRecallToPpud: {
                  ...recommendation.bookRecallToPpud,
                  ppudSentenceId: selectedSentence.id,
                  custodyType: selectedSentence.custodyType,
                  indexOffence: selectedSentence.offence.indexOffence,
                  indexOffenceComment: selectedSentence.offence.indexOffenceComment,
                },
              },
              token: res.locals.user.token,
              featureFlags: res.locals.flags,
            })
          })

          it('redirects to Are Offence Changes Needed page', () => {
            expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppcsPaths.areOffenceChangesNeeded}`)
          })
        })
      })
    })

    describe('Invalid data', () => {
      const res = mockRes({
        locals: {
          urlInfo: { basePath: faker.lorem.slug() },
        },
      })

      const req = mockReq({
        originalUrl: faker.lorem.slug(),
        params: { recommendationId: '123' },
        body: {},
      })

      const next = mockNext()

      beforeEach(async () => {
        await selectPpudSentenceController.post(req, res, next)
      })

      it('sets error in session', () => {
        expect(req.session.errors).toEqual([
          {
            errorId: 'noPpudSentenceSelected',
            href: '#ppudSentenceId',
            invalidParts: undefined,
            name: 'ppudSentenceId',
            text: 'Select an existing sentence or add a new one',
            values: undefined,
          },
        ])
      })

      it('redirects back to original page', () => {
        expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
      })

      it('does not call next function', () => {
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
