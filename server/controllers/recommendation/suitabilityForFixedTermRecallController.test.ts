import { fakerEN_GB as faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import suitabilityForFixedTermRecallController from './suitabilityForFixedTermRecallController'
import getCaseSection from '../caseSummary/getCaseSection'
import { RecommendationResponseGenerator } from '../../../data/recommendations/recommendationGenerator'
import { nextPagePreservingFromPageAndAnchor } from '../recommendations/helpers/urls'
import { isRecommendationDiscretionaryRecall } from '../../utils/fixedTermRecallUtils'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import ErrorGenerator from '../../../data/common/errorGenerator'
import getFormOptions from '../recommendations/suitabilityForFixedTermRecall/formOptions'
import suitabilityInputDisplayValues from '../recommendations/suitabilityForFixedTermRecall/inputDisplayValues'
import getSentenceGroupDetailsFromEnum from '../recommendations/helpers/getSentenceGroupDetails'
import ppPaths from '../../routes/paths/pp.paths'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../caseSummary/getCaseSection')
jest.mock('../recommendations/helpers/urls')
jest.mock('../../utils/fixedTermRecallUtils')
jest.mock('../recommendations/suitabilityForFixedTermRecall/formOptions')
jest.mock('../recommendations/suitabilityForFixedTermRecall/inputDisplayValues')
jest.mock('../recommendations/helpers/getSentenceGroupDetails')
;[true, false].forEach(ftr56SentenceConvictionFeatureFlag => {
  describe(`with ftr56SentenceConvictionFeatureFlag ${ftr56SentenceConvictionFeatureFlag ? 'enabled' : 'disabled'}`, () => {
    describe('get', () => {
      const formOptions = {
        firstOption: { label: faker.lorem.sentence() },
        secondOption: { label: faker.lorem.sentence() },
      }
      const displayValues = {
        firstOption: { label: faker.lorem.sentence(), value: faker.lorem.word() },
        secondOption: { label: faker.lorem.sentence(), value: faker.lorem.word() },
      }
      const sentenceGroupDetails = {
        text: faker.lorem.sentence(),
        value: faker.lorem.word(),
      }

      beforeEach(() => {
        ;(getCaseSection as jest.Mock).mockReturnValueOnce({
          caseSummary: { licence: 'case summary data' },
        })
        ;(getCaseSection as jest.Mock).mockReturnValueOnce({
          caseSummary: { mappa: 'mappa summary data' },
        })
        ;(getFormOptions as jest.Mock).mockReturnValue(formOptions)
        ;(suitabilityInputDisplayValues as jest.Mock).mockReturnValue(displayValues)
        ;(getSentenceGroupDetailsFromEnum as jest.Mock).mockReturnValue(sentenceGroupDetails)
        ;(isRecommendationDiscretionaryRecall as jest.Mock).mockReturnValue(false)
      })

      it('load with no data', async () => {
        const recommendation = RecommendationResponseGenerator.generate({
          sentenceGroup: faker.helpers.arrayElement(
            Object.values(SentenceGroup).filter(
              sentenceGroup => ![SentenceGroup.EXTENDED, SentenceGroup.INDETERMINATE].includes(sentenceGroup),
            ),
          ),
        })
        const res = mockRes({
          locals: {
            recommendation,
            token: 'token1',
            flags: {
              ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
            },
          },
        })

        const next = mockNext()
        await suitabilityForFixedTermRecallController.get(mockReq(), res, next)
        expect(res.locals.caseSummary).toEqual({ licence: 'case summary data', mappa: 'mappa summary data' })
        expect(res.locals.page).toEqual({ id: 'suitabilityForFixedTermRecall' })
        expect(res.locals.inputDisplayValues).toEqual(displayValues)
        expect(res.locals.sentenceGroupDetails).toEqual(sentenceGroupDetails)

        expect(getFormOptions).toHaveBeenCalledWith(
          recommendation.personOnProbation.name,
          recommendation.sentenceGroup,
          ftr56SentenceConvictionFeatureFlag,
        )
        expect(suitabilityInputDisplayValues).toHaveBeenCalledWith(formOptions, undefined, recommendation)
        expect(getSentenceGroupDetailsFromEnum).toHaveBeenCalledWith(recommendation.sentenceGroup)
        expect(res.render).toHaveBeenCalledWith('pages/recommendations/suitabilityForFixedTermRecall')
        expect(next).toHaveBeenCalled()
      })

      it('load with errors', async () => {
        const errors = ErrorGenerator.generate()
        const res = mockRes({
          locals: {
            unsavedValues: {
              isMappaCategory4: 'NO',
              isMappaLevel2Or3: 'YES',
            },
            recommendation: RecommendationResponseGenerator.generate(),
            token: 'token1',
            errors,
            flags: {
              ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
            },
          },
        })
        const next = mockNext()
        await suitabilityForFixedTermRecallController.get(mockReq(), res, next)

        expect(res.locals.errors).toEqual(errors)
      })

      describe('redirects when sentenceGroup is not Determinate', () => {
        ;[SentenceGroup.INDETERMINATE, SentenceGroup.EXTENDED].forEach(sentenceGroup => {
          it(`redirects when sentence group is ${sentenceGroup}`, async () => {
            const recommendation = RecommendationResponseGenerator.generate({
              sentenceGroup,
            })
            const res = mockRes({
              locals: {
                recommendation,
                token: 'token1',
                flags: {
                  ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
                },
              },
            })

            await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

            expect(res.redirect).toHaveBeenCalledWith(
              303,
              `/recommendations/${recommendation.id}/${ppPaths.indeterminateDetails}`,
            )
          })
        })
      })

      it('shows the warning banner when the sentenceGroup is YOUTH_SDS and the recallType is not null', async () => {
        ;(isRecommendationDiscretionaryRecall as jest.Mock).mockReturnValueOnce(true)
        const res = mockRes({
          locals: {
            recommendation: {
              personOnProbation: {
                name: 'Test McTest',
              },
              sentenceGroup: SentenceGroup.YOUTH_SDS,
              recallType: '123',
            },
            flags: {
              ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
            },
          },
        })

        await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

        expect(res.locals.page.warningPanel).toEqual({
          body: `Changing your answers could make Test McTest eligible for a mandatory fixed term recall. If this happens, information explaining your previous recall type selection will be deleted.`,
          title: 'Changes could affect your recall recommendation choices',
        })
      })

      it('does not show the warning banner when sentenceGroup is YOUTH_SDS but the recallType is null', async () => {
        ;(isRecommendationDiscretionaryRecall as jest.Mock).mockReturnValueOnce(true)
        const res = mockRes({
          locals: {
            recommendation: RecommendationResponseGenerator.generate({
              sentenceGroup: SentenceGroup.YOUTH_SDS,
              recallType: 'none',
            }),
            flags: {
              ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
            },
          },
        })

        await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

        expect(res.locals.page.warningPanel).toBeUndefined()
      })

      it('does not show the warning banner when sentenceGroup is ADULT_SDS', async () => {
        const res = mockRes({
          locals: {
            recommendation: {
              personOnProbation: {
                name: 'Test McTest',
              },
              sentenceGroup: SentenceGroup.ADULT_SDS,
              recallType: '123',
            },
            flags: {
              ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
            },
          },
        })

        await suitabilityForFixedTermRecallController.get(mockReq(), res, mockNext())

        expect(res.locals.page.warningPanel).toBeUndefined()
      })
    })

    describe('post', () => {
      const expectedResolvedRedirectUrl = faker.internet.url()
      beforeEach(() => {
        ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
        ;(nextPagePreservingFromPageAndAnchor as jest.Mock).mockReturnValue(expectedResolvedRedirectUrl)
      })
      const basePath = `/recommendations/123/`

      describe('post with valid data', () => {
        const formOptions = {
          firstOption: { label: faker.lorem.sentence() },
          secondOption: { label: faker.lorem.sentence() },
        }
        const formOptionsAnswers = {
          firstOption: faker.helpers.arrayElement(['YES', 'NO']),
          secondOption: faker.helpers.arrayElement(['YES', 'NO']),
        }
        ;[true, false].forEach(recallTypePreserved => {
          ;[SentenceGroup.YOUTH_SDS, SentenceGroup.ADULT_SDS].forEach(sentenceGroup => {
            describe(`with sentence group ${sentenceGroup}`, () => {
              it(`${recallTypePreserved ? 'does not clear' : 'clears'} the recallType and rationale if the criteria has ${recallTypePreserved ? 'not ' : ''}changed`, async () => {
                const postBody =
                  sentenceGroup === SentenceGroup.YOUTH_SDS
                    ? {
                        // NB: Whilst the MAPPA category 4 value isn't relevant to the mandatory FTR criteria,
                        // it's still required in the Part A so we're just checking it's being updated in the API
                        isMappaCategory4: faker.helpers.arrayElement(['YES', 'NO']),
                        isMappaLevel2Or3: faker.helpers.arrayElement(['YES', 'NO']),
                        ...formOptionsAnswers,
                      }
                    : formOptionsAnswers
                const req = mockReq({
                  params: { recommendationId: '123' },
                  body: {
                    ...postBody,
                  },
                })
                const priorRecommendation = RecommendationResponseGenerator.generate({
                  sentenceGroup,
                  recallType: 'any',
                })
                const previousAnswers = recallTypePreserved
                  ? {
                      firstOption: formOptionsAnswers.firstOption === 'YES',
                      secondOption: formOptionsAnswers.secondOption === 'YES',
                    }
                  : {
                      firstOption: formOptionsAnswers.firstOption !== 'YES',
                      secondOption: formOptionsAnswers.secondOption !== 'YES',
                    }
                const res = mockRes({
                  token: 'token1',
                  locals: {
                    recommendation: {
                      ...priorRecommendation,
                      ...previousAnswers,
                    },
                    urlInfo: { basePath },
                    statuses: [],
                    flags: {
                      ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
                    },
                  },
                })
                const next = mockNext()
                ;(getFormOptions as jest.Mock).mockReturnValue(formOptions)

                await suitabilityForFixedTermRecallController.post(req, res, next)

                expect(updateRecommendation).toHaveBeenCalledWith({
                  recommendationId: '123',
                  token: 'token1',
                  valuesToSave: {
                    ...Object.fromEntries(Object.entries(postBody).map(([key, value]) => [key, value === 'YES'])),
                    ...(!recallTypePreserved
                      ? {
                          recallType: {
                            selected: { value: null },
                            allOptions: priorRecommendation.recallType.allOptions,
                          },
                        }
                      : {}),
                  },
                  featureFlags: {
                    ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
                  },
                })

                expect(res.redirect).toHaveBeenCalledWith(303, expectedResolvedRedirectUrl)
                expect(next).not.toHaveBeenCalled() // end of the line for posts.
              })
            })
          })
        })
      })

      it('post with invalid data', async () => {
        const req = mockReq({
          params: { recommendationId: '123' },
          originalUrl: 'some-url',
          body: {
            isYouthChargedWithSeriousOffence: '',
            isYouthSentenceOver12Months: '',
          },
        })

        const res = mockRes({
          token: 'token1',
          locals: {
            recommendation: {
              personOnProbation: { name: faker.person.fullName() },
              sentenceGroup: SentenceGroup.YOUTH_SDS,
            },
            urlInfo: { basePath },
            statuses: [],
            flags: {
              ftr56SentenceConviction: ftr56SentenceConvictionFeatureFlag,
            },
          },
        })
        const next = mockNext()

        // we require form option keys for which there is an error entry of the form 'no<fieldKey>',
        // hence why we use real form options rather than generic values as we have done above
        ;(getFormOptions as jest.Mock).mockReturnValue({
          isYouthSentenceOver12Months: {
            label: `Is ${res.locals.recommendation.personOnProbation.name}'s sentence 12 months or over?`,
          },
          isYouthChargedWithSeriousOffence: {
            label: `Is ${res.locals.recommendation.personOnProbation.name} being recalled because of being charged with a serious offence?`,
          },
        })

        await suitabilityForFixedTermRecallController.post(req, res, next)
        expect(updateRecommendation).not.toHaveBeenCalled()

        expect(req.session.errors).toEqual([
          {
            name: 'isYouthSentenceOver12Months',
            text: "Select whether {{ fullName }}'s sentence is 12 months or over",
            href: '#isYouthSentenceOver12Months',
            errorId: 'noIsYouthSentenceOver12Months',
            invalidParts: undefined,
            values: undefined,
          },
          {
            name: 'isYouthChargedWithSeriousOffence',
            text: 'Select whether {{ fullName }} is being recalled because of being charged with a serious offence',
            href: '#isYouthChargedWithSeriousOffence',
            errorId: 'noIsYouthChargedWithSeriousOffence',
            invalidParts: undefined,
            values: undefined,
          },
        ])
        expect(req.session.unsavedValues).toEqual({
          isYouthSentenceOver12Months: '',
          isYouthChargedWithSeriousOffence: '',
        })
        expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
      })
    })
  })
})
