import { Response } from 'express'
import { fakerEN_GB as faker } from '@faker-js/faker'
import triggerLeadingToRecallController from './triggerLeadingToRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { ppPaths } from '../../routes/paths/pp'
import { strings } from '../../textStrings/en'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { UrlInfoGenerator } from '../../../data/common/urlInfoGenerator'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/helpers/urls')

describe('Trigger Leading to Recall Controller', () => {
  describe('get', () => {
    ;[true, false].forEach(flagFTR56Enabled => {
      describe(`FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
        describe('Non-conditional logic:', () => {
          const recommendation = RecommendationResponseGenerator.generate()
          const urlInfo = UrlInfoGenerator.generate()
          const next = mockNext()
          let res: Response
          beforeEach(() => {
            res = mockRes({
              locals: {
                recommendation,
                flags: { flagFTR56Enabled },
                urlInfo,
              },
            })
            triggerLeadingToRecallController.get(mockReq(), res, next)
          })

          describe('Res locals', () => {
            describe('Page Data is provided:', () => {
              it('Page ID', () => expect(res.locals.pageData.page).toEqual({ id: 'triggerLeadingToRecall' }))
              it('Recommendation', () => expect(res.locals.pageData.recommendation).toEqual(recommendation))
              it('FTR56 flag value', () => expect(res.locals.pageData.flagFTR56Enabled).toEqual(flagFTR56Enabled))
              if (flagFTR56Enabled) {
                it('Back link URL', () =>
                  expect(res.locals.pageData.backLinkUrl).toEqual(
                    `${urlInfo.basePath}${ppPaths.taskListConsiderRecall}`
                  ))
              }
            })
          })

          it('- Calls render for the expected page', async () =>
            expect(res.render).toHaveBeenCalledWith(`pages/recommendations/triggerLeadingToRecall`))

          it('- Executes the next function', async () => expect(next).toHaveBeenCalled())
        })
      })
    })
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
  ;[true, false].forEach(flagFTR56Enabled => {
    describe(`FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
      describe('Valid trigger text provided:', () => {
        const recommendationId = faker.number.int().toString()
        const triggerLeadingToRecall = faker.lorem.paragraph()
        const req = mockReq({
          params: { recommendationId },
          body: { triggerLeadingToRecall },
        })

        const urlInfo = UrlInfoGenerator.generate()
        const nextPageUrl = faker.internet.url()
        const next = mockNext()
        let res: Response
        beforeEach(async () => {
          res = mockRes({
            token: 'token1',
            locals: {
              urlInfo,
              flags: { flagFTR56Enabled },
            },
          })
          ;(updateRecommendation as jest.Mock).mockResolvedValue({})
          ;(nextPageLinkUrl as jest.Mock).mockReturnValue(nextPageUrl)

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
            featureFlags: res.locals.flags,
          })
        })
        it('Next page URL retrieved', () =>
          expect(nextPageLinkUrl).toHaveBeenCalledWith({
            nextPageId: flagFTR56Enabled ? ppPaths.licenceConditions : ppPaths.taskListConsiderRecall,
            urlInfo,
          }))
        it(`Redirected to ${nextPageUrl} page`, () => expect(res.redirect).toHaveBeenCalledWith(303, nextPageUrl))
        expect(next).not.toHaveBeenCalled() // end of the line for posts.
      })
    })
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
