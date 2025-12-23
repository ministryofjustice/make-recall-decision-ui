import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import selectPpudSentenceController from './selectPpudSentenceController'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { ppcsPaths } from '../../routes/paths/ppcs'

jest.mock('../../data/makeDecisionApiClient')

describe('Select Determinate PPUD Sentence Controller', () => {
  describe('get', () => {
    const recommendation = RecommendationResponseGenerator.generate()
    const res = mockRes({ locals: { recommendation } })
    const next = mockNext()

    describe('Non conditional logic:', () => {
      beforeEach(async () => {
        await selectPpudSentenceController.get(mockReq(), res, next)
      })
      describe('Res locals:', () => {
        describe('Page:', () => {
          it('- Is provided', () => expect(res.locals.page).toBeDefined())
          it('- Correct id', () => {
            expect(res.locals.page.id).toEqual('selectPpudSentence')
          })
        })
        describe('Selected NOMIS offence:', () => {
          it('- Is provided', () => expect(res.locals.offence).toBeDefined())
          it('- Is correct', () => {
            expect(res.locals.offence).toEqual(recommendation.nomisIndexOffence.allOptions[0])
          })
        })
      })
      it('- Calls render for the expected page', () =>
        expect(res.render).toHaveBeenCalledWith(`pages/recommendations/selectPpudSentence`))
      it('- Executes the next function', () => expect(next).toHaveBeenCalled())
    })
  })

  describe('post', () => {
    describe('Valid data', () => {
      // We create a recommendation with index offence data included to test that it is
      // cleared when adding a new sentence and overwritten when selecting an existing sentence
      const recommendation = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          indexOffence: 'include',
          indexOffenceComment: 'include',
        },
      })

      const basePath = `/recommendations/123/`
      const res = mockRes({
        locals: {
          urlInfo: { basePath },
        },
      })

      const next = mockNext()

      describe('Non-conditional logic:', () => {
        const req = mockReq({
          originalUrl: 'some-url',
          params: { recommendationId: '123' },
          body: { ppudSentenceId: faker.helpers.arrayElement(recommendation.ppudOffender.sentences).id },
        })
        beforeEach(async () => {
          ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
          await selectPpudSentenceController.post(req, res, next)
        })
        it('- Calls next function', () => expect(next).toHaveBeenCalled())
      })
      describe('Conditional logic:', () => {
        describe('Option to add new sentence to PPUD selected', () => {
          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '123' },
            body: { ppudSentenceId: 'ADD_NEW' },
          })
          beforeEach(async () => {
            ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
            await selectPpudSentenceController.post(req, res, next)
          })
          it('- Updates recommendation with selection but custody type as undefined', () => {
            expect(updateRecommendation).toHaveBeenCalledWith({
              recommendationId: req.params.recommendationId,
              valuesToSave: {
                bookRecallToPpud: {
                  ...recommendation.bookRecallToPpud,
                  ppudSentenceId: req.body.ppudSentenceId,
                  custodyType: undefined,
                  indexOffence: undefined,
                  indexOffenceComment: undefined,
                },
              },
              token: res.locals.user.token,
              featureFlags: res.locals.flags,
            })
          })
          it('- Redirects to Match Index Offence page', () => {
            expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppcsPaths.matchIndexOffence}`)
          })
        })
        describe('Existing PPUD sentence selected', () => {
          const req = mockReq({
            originalUrl: 'some-url',
            params: { recommendationId: '123' },
            body: { ppudSentenceId: faker.helpers.arrayElement(recommendation.ppudOffender.sentences).id },
          })
          beforeEach(async () => {
            ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
            await selectPpudSentenceController.post(req, res, next)
          })
          it('- Updates recommendation with selection and corresponding custody type', () => {
            const selectedSentence = recommendation.ppudOffender.sentences.find(s => s.id === req.body.ppudSentenceId)
            expect(updateRecommendation).toHaveBeenCalledWith({
              recommendationId: req.params.recommendationId,
              valuesToSave: {
                bookRecallToPpud: {
                  ...recommendation.bookRecallToPpud,
                  ppudSentenceId: req.body.ppudSentenceId,
                  custodyType: selectedSentence.custodyType,
                  indexOffence: selectedSentence.offence.indexOffence,
                  indexOffenceComment: selectedSentence.offence.offenceComment,
                },
              },
              token: res.locals.user.token,
              featureFlags: res.locals.flags,
            })
          })
          it('- Redirects to Are Offence Changes Needed page', () => {
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

      it('- Sets error in session', () => {
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
      it('- Redirects back to original page', () => expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl))
      it('- Does not call next function', () => expect(next).not.toHaveBeenCalled())
    })
  })
})
