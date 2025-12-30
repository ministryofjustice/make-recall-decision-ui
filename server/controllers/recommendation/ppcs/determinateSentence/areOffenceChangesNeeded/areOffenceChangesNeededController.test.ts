import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../../../../middleware/testutils/mockRequestUtils'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import areOffenceChangesNeededController from './areOffenceChangesNeededController'
import { yesNoOptions, yesNoToBoolean, YesNoValues } from '../../../../recommendations/formOptions/yesNo'
import { isDefined } from '../../../../../utils/utils'
import { ppcsPaths } from '../../../../../routes/paths/ppcs'
import { getRecommendation, updateRecommendation } from '../../../../../data/makeDecisionApiClient'
import { strings } from '../../../../../textStrings/en'

jest.mock('../../../../../data/makeDecisionApiClient')
jest.mock('../../../../../utils/utils')

describe('Are Offence Changes Needed Controller', () => {
  const yesNoOffenceChanges = yesNoOptions({
    [YesNoValues.YES]: strings.labels.yesOffenceChanges,
    [YesNoValues.NO]: strings.labels.no,
  })

  describe('get', () => {
    const req = mockReq({
      params: { recommendationId: faker.number.int().toString() },
    })
    const next = mockNext()

    describe('Non-conditional logic:', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      const selectedPpudSentence = faker.helpers.arrayElement(recommendation.ppudOffender.sentences)
      recommendation.bookRecallToPpud.ppudSentenceId = selectedPpudSentence.id

      const res = mockRes({
        locals: { recommendation },
      })

      beforeEach(async () => {
        await areOffenceChangesNeededController.get(req, res, next)
      })
      it('Calls render for the expected page', () =>
        expect(res.render).toHaveBeenCalledWith(
          'pages/recommendations/ppcs/determinateSentence/areOffenceChangesNeeded'
        ))
      it('Executes the next function', () => expect(next).toHaveBeenCalled())
      describe('Res locals:', () => {
        describe('Page:', () => {
          it('Is provided', () => expect(res.locals.page).toBeDefined())
          it('Correct id', () => expect(res.locals.page.id).toEqual('areOffenceChangesNeeded'))
        })
        describe('Selected PPUD sentence', () => {
          it('Is provided', () => expect(res.locals.selectedPpudSentence).toBeDefined())
          it('Is correct', () => expect(res.locals.selectedPpudSentence).toEqual(selectedPpudSentence))
        })
      })
    })

    describe('Conditional logic:', () => {
      describe('No option selected', () => {
        const recommendation = RecommendationResponseGenerator.generate({
          bookRecallToPpud: {
            changeOffenceOrAddComment: 'none',
          },
        })

        const res = mockRes({
          locals: { recommendation },
        })

        beforeEach(async () => {
          await areOffenceChangesNeededController.get(req, res, next)
        })
        describe('Res locals:', () => {
          describe('Selected option', () => {
            it('Is not provided', () => expect(res.locals.selectedOption).not.toBeDefined())
          })
        })
      })
      yesNoOffenceChanges
        .map(o => o.value)
        .forEach(optionValue => {
          describe(`Option ${optionValue} selected`, () => {
            const recommendation = RecommendationResponseGenerator.generate({
              bookRecallToPpud: {
                changeOffenceOrAddComment: yesNoToBoolean(optionValue),
              },
            })

            const res = mockRes({
              locals: { recommendation },
            })

            beforeEach(async () => {
              await areOffenceChangesNeededController.get(req, res, next)
            })
            describe('Res locals:', () => {
              describe('Selected option', () => {
                it('Is provided', () => expect(res.locals.selectedOption).toBeDefined())
                it('Correct id', () => expect(res.locals.selectedOption).toEqual(optionValue))
              })
            })
          })
        })
    })
  })
  describe('post', () => {
    describe('with valid data', () => {
      const recommendation = RecommendationResponseGenerator.generate()
      const basePath = faker.lorem.slug()
      const res = mockRes({
        locals: {
          urlInfo: { basePath },
          flags: { xyz: true },
        },
      })
      const next = mockNext()

      describe('Non-conditional logic:', () => {
        const req = mockReq({
          params: { recommendationId: '1' },
          body: {
            changeOffenceOrAddComment: faker.helpers.arrayElement(yesNoOffenceChanges).value,
          },
        })

        beforeEach(async () => {
          ;(isDefined as jest.Mock).mockReturnValue(true)
          ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
          ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendation)
          await areOffenceChangesNeededController.post(req, res, next)
        })

        it('Checks if option is defined', () =>
          expect(isDefined).toHaveBeenCalledWith(req.body.changeOffenceOrAddComment))
        it('Does not call next function', () => expect(next).not.toHaveBeenCalled())
      })

      describe('Conditional logic:', () => {
        yesNoOffenceChanges
          .map(o => o.value)
          .forEach(optionValue => {
            describe(`Option ${optionValue} selected`, () => {
              const req = mockReq({
                params: { recommendationId: recommendation.id.toString() },
                body: {
                  changeOffenceOrAddComment: optionValue,
                },
              })
              beforeEach(async () => {
                ;(isDefined as jest.Mock).mockReturnValue(true)
                ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
                ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendation)
                await areOffenceChangesNeededController.post(req, res, next)
              })

              it('Updates the recommendation with the selected option', () => {
                expect(updateRecommendation).toHaveBeenCalledWith({
                  recommendationId: recommendation.id.toString(),
                  valuesToSave: {
                    bookRecallToPpud: {
                      ...recommendation.bookRecallToPpud,
                      changeOffenceOrAddComment: yesNoToBoolean(req.body.changeOffenceOrAddComment),
                    },
                  },
                  token: res.locals.user.token,
                  featureFlags: {
                    xyz: true,
                  },
                })
              })

              if (optionValue === YesNoValues.YES) {
                it('Redirects to the Match Index Offence page', () =>
                  expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppcsPaths.matchIndexOffence}`))
              } else {
                it('redirects to Sentence to Commit Existing page', () =>
                  expect(res.redirect).toHaveBeenCalledWith(
                    303,
                    `${basePath}${ppcsPaths.sentenceToCommitExistingOffender}`
                  ))
              }
            })
          })
      })
    })

    describe('with invalid data', () => {
      ;[true, false].forEach(selectionDefined => {
        describe(`and selection ${selectionDefined ? 'defined' : 'not defined'}`, () => {
          const basePath = faker.lorem.slug()
          const req = mockReq({
            originalUrl: faker.lorem.slug(),
            params: { recommendationId: '1' },
            body: {
              changeOffenceOrAddComment: faker.lorem.word(),
            },
          })

          const res = mockRes({
            locals: {
              urlInfo: { basePath },
              flags: { xyz: true },
            },
          })
          const next = mockNext()

          beforeEach(async () => {
            ;(isDefined as jest.Mock).mockReturnValue(selectionDefined)
            await areOffenceChangesNeededController.post(req, res, next)
          })
          it('Checks if selected option is defined', () =>
            expect(isDefined).toHaveBeenCalledWith(req.body.changeOffenceOrAddComment))
          it('Logs expected error', () => {
            expect(req.session.errors).toEqual([
              {
                errorId: 'missingChangeOffenceOrAddComment',
                invalidParts: undefined,
                href: '#changeOffenceOrAddComment',
                name: 'changeOffenceOrAddComment',
                text: 'Select an option',
                values: undefined,
              },
            ])
          })
          it('Redirects to original URL', () => expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl))
          it('Does not retrieve recommendation', () => expect(getRecommendation).not.toHaveBeenCalled())
          it('Does not update recommendation', () => expect(updateRecommendation).not.toHaveBeenCalled())
          it('Does not call next function', () => expect(next).not.toHaveBeenCalled())
        })
      })
    })
  })
})
