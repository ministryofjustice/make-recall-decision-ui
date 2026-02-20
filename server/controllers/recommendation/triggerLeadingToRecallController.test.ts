import { Response } from 'express'
import { fakerEN_GB as faker } from '@faker-js/faker'
import triggerLeadingToRecallController from './triggerLeadingToRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { ppPaths } from '../../routes/paths/pp'
import { strings } from '../../textStrings/en'

jest.mock('../../data/makeDecisionApiClient')

describe('Trigger Leading to Recall Controller', () => {
  describe('get', () => {
    describe('Non-conditional logic:', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      const next = mockNext()
      let res: Response
      beforeEach(() => {
        res = mockRes({
          locals: {
            recommendation,
          },
        })
        triggerLeadingToRecallController.get(mockReq(), res, next)
      })

      describe('Res locals', () => {
        describe('Page Data is provided:', () => {
          it('Page ID', () => expect(res.locals.pageData.page).toEqual({ id: 'triggerLeadingToRecall' }))
          it('Recommendation', () => expect(res.locals.pageData.recommendation).toEqual(recommendation))
        })
      })

      it('- Calls render for the expected page', async () =>
        expect(res.render).toHaveBeenCalledWith(`pages/recommendations/triggerLeadingToRecall`))

      it('- Executes the next function', async () => expect(next).toHaveBeenCalled())
    })

    describe('Conditional logic:', () => {
      describe('No errors defined', () => {
        describe('No previous trigger leading to recall recorded:', () => {
          let res: Response
          const recommendation = RecommendationResponseGenerator.generate({ triggerLeadingToRecall: false })
          beforeEach(() => {
            res = mockRes({
              locals: {
                recommendation,
              },
            })
            triggerLeadingToRecallController.get(mockReq(), res, mockNext())
          })
          describe('Res locals', () => {
            describe('Page Data is provided:', () => {
              it('No trigger value', () => expect(res.locals.pageData.inputDisplayValues.value).not.toBeDefined())
              it('No errors', () => expect(res.locals.pageData.inputDisplayValues.errors).not.toBeDefined())
            })
          })
        })

        describe('Previous trigger leading to recall recorded:', () => {
          let res: Response
          const recommendation = RecommendationResponseGenerator.generate({ triggerLeadingToRecall: true })
          beforeEach(() => {
            res = mockRes({
              locals: {
                recommendation,
              },
            })
            const next = mockNext()
            triggerLeadingToRecallController.get(mockReq(), res, next)
          })
          describe('Res locals', () => {
            describe('Page Data is provided:', () => {
              it('Trigger value', () =>
                expect(res.locals.pageData.inputDisplayValues.value).toEqual(recommendation.triggerLeadingToRecall))
              it('No errors', () => expect(res.locals.pageData.inputDisplayValues.errors).not.toBeDefined())
            })
          })
        })
      })

      describe('Errors defined', () => {
        const error = faker.lorem.sentence()
        let res: Response
        beforeEach(() => {
          res = mockRes({
            locals: {
              errors: { triggerLeadingToRecall: error },
              recommendation: RecommendationResponseGenerator.generate(),
            },
          })
          triggerLeadingToRecallController.get(mockReq(), res, mockNext())
        })
        describe('Res locals', () => {
          describe('Page Data is provided:', () => {
            it('No trigger value', () => expect(res.locals.pageData.inputDisplayValues.value).toEqual(''))
            it('Errors for triggerLeadingToRecall', () =>
              expect(res.locals.pageData.inputDisplayValues.errors.triggerLeadingToRecall).toEqual(error))
          })
        })
      })
    })
  })

  describe('post', () => {
    describe('Valid trigger text provided:', () => {
      const recommendationId = faker.number.int().toString()
      const triggerLeadingToRecall = faker.lorem.paragraph()
      const req = mockReq({
        params: { recommendationId },
        body: { triggerLeadingToRecall },
      })

      const basePath = faker.internet.url()
      const next = mockNext()
      let res: Response
      beforeEach(async () => {
        res = mockRes({
          token: 'token1',
          locals: {
            urlInfo: { basePath },
          },
        })
        ;(updateRecommendation as jest.Mock).mockResolvedValue({})

        await triggerLeadingToRecallController.post(req, res, next)
      })

      it('No errors logged', () => expect(req.session.errors).toBeUndefined())
      it('Recommendation updated', () => {
        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId,
          token: res.locals.user.token,
          valuesToSave: {
            triggerLeadingToRecall,
          },
          featureFlags: {},
        })
      })
      it('Redirected to task-list-consider-recall page', () =>
        expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppPaths.taskListConsiderRecall}`))
      expect(next).not.toHaveBeenCalled() // end of the line for posts.
    })

    describe('Invalid trigger text provided', () => {
      const recommendationId = faker.number.int().toString()
      const originalUrl = faker.internet.url()
      const req = mockReq({
        params: { recommendationId },
        body: { triggerLeadingToRecall: '' },
        originalUrl,
      })

      const next = mockNext()
      let res: Response
      beforeEach(async () => {
        res = mockRes()
        await triggerLeadingToRecallController.post(req, res, next)
      })

      it('Error for missing trigger added to session', () => {
        expect(req.session.errors).toEqual([
          {
            errorId: 'missingTriggerLeadingToRecall',
            href: '#triggerLeadingToRecall',
            invalidParts: undefined,
            name: 'triggerLeadingToRecall',
            text: strings.errors.missingTriggerLeadingToRecall,
            values: undefined,
          },
        ])
      })
      it('Redirected to same page', () => expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl))
      it('Recommendation is not updated', () => expect(updateRecommendation).not.toHaveBeenCalled())
    })
  })
})
