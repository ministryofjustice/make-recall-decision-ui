import { faker } from '@faker-js/faker'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import { getRecommendation, prisonSentences, updateRecommendation } from '../../../../data/makeDecisionApiClient'
import selectIndexOffenceController from './selectIndexOffenceController'
import { PrisonSentence } from '../../../../@types/make-recall-decision-api/models/PrisonSentence'
import { RecommendationResponse } from '../../../../@types/make-recall-decision-api'
import {
  PrisonSentenceGenerator,
  PrisonSentenceOptions,
} from '../../../../../data/prisonSentences/prisonSentenceGenerator'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import { TermGenerator } from '../../../../../data/common/termGenerator'
import { ppcsPaths } from '../../../../routes/paths/ppcs'
import { PrisonSentenceSequenceGenerator } from '../../../../../data/prisonSentences/prisonSentenceSequenceGenerator'
import { PrisonSentenceSequence } from '../../../../@types/make-recall-decision-api/models/prison-api/PrisonSentenceSequence'
import { OfferedOffence } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'

jest.mock('../../../../data/makeDecisionApiClient')

const recommendationId = 123

const expectedOptionForSentence = (sentence: PrisonSentence, expectedConsecutiveCount: number) =>
  ({
    bookingId: sentence.bookingId,
    consecutiveCount: expectedConsecutiveCount,
    courtDescription: sentence.courtDescription,
    offenceCode: sentence.offences.at(0).offenceCode,
    offenceDate: sentence.offences.at(0).offenceStartDate,
    offenceDescription: sentence.offences.at(0).offenceDescription,
    offenceStatute: sentence.offences.at(0).offenceStatute,
    offenderChargeId: sentence.offences.at(0).offenderChargeId,
    sentenceDate: sentence.sentenceDate,
    sentenceEndDate: sentence.sentenceEndDate,
    sentenceStartDate: sentence.sentenceStartDate,
    sentenceTypeDescription: sentence.sentenceTypeDescription,
    terms: sentence.terms,
    releaseDate: sentence.releaseDate,
    licenceExpiryDate: sentence.licenceExpiryDate,
    releasingPrison: sentence.releasingPrison,
  }) as OfferedOffence

const expectedNomisOffenceForSentence = (sentence: PrisonSentence) => ({
  id: sentence.offences[0].offenderChargeId,
  description: sentence.offences[0].offenceDescription,
  sentenceType: sentence.sentenceTypeDescription,
  court: sentence.courtDescription,
  dateOfSentence: sentence.sentenceDate,
  startDate: sentence.sentenceStartDate,
  endDate: sentence.sentenceEndDate,
})

const expectedConvictionDataForRecommendation = (recommendation: RecommendationResponse) => ({
  description: recommendation.convictionDetail.indexOffenceDescription,
  dateOfSentence: recommendation.convictionDetail.dateOfSentence,
  sentenceType: recommendation.convictionDetail.sentenceDescription,
  sentenceExpiryDate: recommendation.convictionDetail.sentenceExpiryDate,
})

const expectedErrorMessage = 'No sentences found'

const next = mockNext()

describe('Select Index Offence Controller', () => {
  describe('get', () => {
    const defaultGetRecommendation = RecommendationResponseGenerator.generate({
      nomisIndexOffence: 'none',
    })
    const defaultGetSentence = PrisonSentenceGenerator.generate()
    const defaultGetSentenceSequence: PrisonSentenceSequence = {
      indexSentence: defaultGetSentence,
    }
    const req = mockReq({
      params: { recommendationId: '123' },
    })
    const res = mockRes({
      locals: {
        recommendation: defaultGetRecommendation,
      },
    })
    describe('Non conditional logic:', () => {
      beforeEach(async () => {
        ;(prisonSentences as jest.Mock).mockResolvedValue([defaultGetSentenceSequence])
        await selectIndexOffenceController.get(req, res, next)
      })

      it('- Prison Sentences correctly called', async () =>
        expect(prisonSentences).toHaveBeenCalledWith('token', defaultGetRecommendation.personOnProbation.nomsNumber))
      it('- Update Recommendation is called with only the index offered offences', async () => {
        const multipleSentenceSequencesWithConsecutives = PrisonSentenceSequenceGenerator.generateSeries([
          { indexSentence: {}, sentencesInSequence: null },
          { indexSentence: {}, sentencesInSequence: new Map([[2, [{}]]]) },
          { indexSentence: {}, sentencesInSequence: new Map([[3, [{}, {}, {}]]]) },
        ])
        ;(prisonSentences as jest.Mock).mockResolvedValue(multipleSentenceSequencesWithConsecutives)
        ;(updateRecommendation as jest.Mock).mockReset()
        await selectIndexOffenceController.get(req, res, next)

        expect(updateRecommendation).toHaveBeenCalledWith({
          featureFlags: {},
          recommendationId: recommendationId.toString(),
          token: 'token',
          valuesToSave: {
            nomisIndexOffence: {
              selected: undefined,
              allOptions: [
                expectedOptionForSentence(multipleSentenceSequencesWithConsecutives.at(0).indexSentence, undefined),
                expectedOptionForSentence(multipleSentenceSequencesWithConsecutives.at(1).indexSentence, 1),
                expectedOptionForSentence(multipleSentenceSequencesWithConsecutives.at(2).indexSentence, 3),
              ],
            },
          },
        })
      })
      it('- Calls render for the expected page', async () =>
        expect(res.render).toHaveBeenCalledWith(`pages/recommendations/ppcs/determinateSentence/selectIndexOffence`))
      it('- Executes the next function', async () => expect(next).toHaveBeenCalled())

      describe('Res locals:', () => {
        describe('Page:', () => {
          it('- Is provided', async () => expect(res.locals.page).toBeDefined())
          it('- Correct id', async () => {
            expect(res.locals.page).toBeDefined()
            expect(res.locals.page.id).toEqual('selectIndexOffence')
          })
        })

        describe('Page Data:', () => {
          it('- Is provided', async () => expect(res.locals.pageData).toBeDefined())
          describe('Offender name:', () => {
            it('- Correct value', async () =>
              expect(res.locals.pageData.offenderName).toEqual(
                `${defaultGetRecommendation.bookRecallToPpud.firstNames} ${defaultGetRecommendation.bookRecallToPpud.lastName}`
              ))
          })
          describe('Nomis Offence Data', () => {
            const expectedNomisOffenceData = expectedNomisOffenceForSentence(defaultGetSentence)

            it('- Is provided', async () => expect(res.locals.pageData.nomisOffenceData).toBeDefined())
            it('- Expected length', async () => expect(res.locals.pageData.nomisOffenceData).toHaveLength(1))
            const offenceData = () => res.locals.pageData.nomisOffenceData[0]
            it(' - id', async () => expect(offenceData().id).toEqual(expectedNomisOffenceData.id))
            it(' - description', async () =>
              expect(offenceData().description).toEqual(expectedNomisOffenceData.description))
            it(' - sentenceType', async () =>
              expect(offenceData().sentenceType).toEqual(expectedNomisOffenceData.sentenceType))
            it(' - court', async () => expect(offenceData().court).toEqual(expectedNomisOffenceData.court))
            it(' - dateOfSentence', async () =>
              expect(offenceData().dateOfSentence).toEqual(expectedNomisOffenceData.dateOfSentence))
            it(' - startDate', async () => expect(offenceData().startDate).toEqual(expectedNomisOffenceData.startDate))
            it(' - endDate', async () => expect(offenceData().endDate).toEqual(expectedNomisOffenceData.endDate))
            it(' - terms (to be defined, conditional)', async () => expect(offenceData().terms).toBeDefined())
            it(' - consecutiveCount (to be undefined, conditional)', async () =>
              expect(offenceData().consecutiveCount).toBeUndefined())
          })
          describe('Conviction data', () => {
            const expectedConvictionData = expectedConvictionDataForRecommendation(defaultGetRecommendation)

            it('- Is provided', async () => expect(res.locals.pageData.convictionData).toBeDefined())
            const convictionData = () => res.locals.pageData.convictionData
            it('- description', async () =>
              expect(convictionData().description).toEqual(expectedConvictionData.description))
            it('- dateOfSentence', async () =>
              expect(convictionData().dateOfSentence).toEqual(expectedConvictionData.dateOfSentence))
            it('- sentenceType', async () =>
              expect(convictionData().sentenceType).toEqual(expectedConvictionData.sentenceType))
            it('- sentenceExpiryDate', async () =>
              expect(convictionData().sentenceExpiryDate).toEqual(expectedConvictionData.sentenceExpiryDate))
            it('- terms (to be defined, conditional)', async () => expect(convictionData().terms).toBeDefined())
          })
        })
      })
    })
    describe('Conditional logic', () => {
      describe('NOMIS error message:', () => {
        const setSentencesAndCall = async (sentenceSequences: PrisonSentenceSequence[]) => {
          ;(prisonSentences as jest.Mock).mockResolvedValue(sentenceSequences)
          await selectIndexOffenceController.get(req, res, next)
        }
        it('- Is not set when sentences are provided', async () => {
          await setSentencesAndCall([defaultGetSentenceSequence])
          expect(res.locals.nomisError).toBeUndefined()
        })
        it('- Is set as expected when no sentences are provided', async () => {
          await setSentencesAndCall(undefined)
          expect(res.locals.nomisError).toBeDefined()
          expect(res.locals.nomisError).toEqual(expectedErrorMessage)
        })
        it('- Is set as expected when an empty sentences are provided', async () => {
          await setSentencesAndCall([])
          expect(res.locals.nomisError).toBeDefined()
          expect(res.locals.nomisError).toEqual(expectedErrorMessage)
        })
      })
      describe('Nomis offence data:', () => {
        describe('Terms:', () => {
          it('- Single term, lists key as "Sentence length" with the expected value', async () => {
            const sentenceWithSingleTerm = PrisonSentenceGenerator.generate()

            expect(sentenceWithSingleTerm.terms).toHaveLength(1)
            ;(prisonSentences as jest.Mock).mockResolvedValue([{ indexSentence: sentenceWithSingleTerm }])
            await selectIndexOffenceController.get(req, res, next)

            expect(res.locals.pageData.nomisOffenceData[0].terms).toEqual([
              {
                key: 'Sentence length',
                value: sentenceWithSingleTerm.terms[0],
              },
            ])
          })
          describe('Multiple terms, lists key based on the term code with the expected value', () => {
            const termIMP = TermGenerator.generate({
              code: 'IMP',
              chronos: {
                years: 'include',
                months: 'include',
                weeks: 'include',
                days: 'include',
              },
            })
            const termLIC = TermGenerator.generate({
              code: 'LIC',
              chronos: {
                years: 'include',
                months: 'include',
                weeks: 'include',
                days: 'include',
              },
            })
            const sentenceWithMultipleTerms = PrisonSentenceGenerator.generate({
              terms: [
                {
                  code: termIMP.code,
                  chronos: {
                    years: termIMP.years,
                    months: termIMP.months,
                    weeks: termIMP.weeks,
                    days: termIMP.days,
                  },
                },
                {
                  code: termLIC.code,
                  chronos: {
                    years: termLIC.years,
                    months: termLIC.months,
                    weeks: termLIC.weeks,
                    days: termLIC.days,
                  },
                },
              ],
            })

            beforeEach(async () => {
              expect(sentenceWithMultipleTerms.terms.length).not.toBeLessThan(2)
              ;(prisonSentences as jest.Mock).mockResolvedValue([{ indexSentence: sentenceWithMultipleTerms }])
              await selectIndexOffenceController.get(req, res, next)
            })
            it('- IMP Term: Custodial', async () => {
              const term = res.locals.pageData.nomisOffenceData[0].terms[0]
              expect(term.key).toEqual('Custodial term')
              expect(term.value).toEqual(termIMP)
            })
            it('- LIC Term: Extended', async () => {
              const term = res.locals.pageData.nomisOffenceData[0].terms[1]
              expect(term.key).toEqual('Extended term')
              expect(term.value).toEqual(termLIC)
            })
          })
        })
        describe('Consecutive count:', () => {
          it('- Has no value when the sentence has no consecutive group', async () => {
            ;(prisonSentences as jest.Mock).mockResolvedValue([
              PrisonSentenceSequenceGenerator.generate({ indexSentence: {}, sentencesInSequence: null }),
            ])
            await selectIndexOffenceController.get(req, res, next)

            expect(res.locals.pageData.nomisOffenceData[0].consecutiveCount).toBeUndefined()
          })
          describe('Has the expected value of the consecutive groups length when provided', () => {
            const testCases: {
              title: string
              indexSentenceOptions: PrisonSentenceOptions
              sentencesInSequenceOptions: Map<number, PrisonSentenceOptions[]>
              expectedCount: number
            }[] = [
              {
                title: 'Single consecutive/No concurrents',
                indexSentenceOptions: {},
                sentencesInSequenceOptions: new Map([[1, [{}]]]),
                expectedCount: 1,
              },
              {
                title: 'Single consecutive/Single concurrent',
                indexSentenceOptions: {},
                sentencesInSequenceOptions: new Map([[1, [{}, {}]]]),
                expectedCount: 2,
              },
              {
                title: 'Single consecutive/Multiple concurrents',
                indexSentenceOptions: {},
                sentencesInSequenceOptions: new Map([[1, [{}, {}, {}]]]),
                expectedCount: 3,
              },
              {
                title: 'Multiple consecutives/No concurrents',
                indexSentenceOptions: {},
                sentencesInSequenceOptions: new Map([
                  [1, [{}]],
                  [2, [{}]],
                ]),
                expectedCount: 2,
              },
              {
                title: 'Multiple consecutives/Single concurrent',
                indexSentenceOptions: {},
                sentencesInSequenceOptions: new Map([
                  [1, [{}, {}]],
                  [2, [{}]],
                ]),
                expectedCount: 3,
              },
              {
                title: 'Multiple consecutives/Multiple concurrents',
                indexSentenceOptions: {},
                sentencesInSequenceOptions: new Map([
                  [1, [{}, {}]],
                  [2, [{}, {}]],
                ]),
                expectedCount: 4,
              },
              {
                title: 'Many consecutives/Many concurrents',
                indexSentenceOptions: {},
                sentencesInSequenceOptions: new Map([
                  [1, [{}, {}]],
                  [2, [{}, {}, {}]],
                  [3, [{}]],
                  [4, [{}, {}, {}, {}]],
                ]),
                expectedCount: 10,
              },
            ]
            testCases.forEach(testCase => {
              it(`${testCase.title} - Result: ${testCase.expectedCount}`, async () => {
                ;(prisonSentences as jest.Mock).mockResolvedValue([
                  PrisonSentenceSequenceGenerator.generate({
                    indexSentence: testCase.indexSentenceOptions,
                    sentencesInSequence: testCase.sentencesInSequenceOptions,
                  }),
                ])
                await selectIndexOffenceController.get(req, res, next)

                expect(res.locals.pageData.nomisOffenceData[0].consecutiveCount).toEqual(testCase.expectedCount)
              })
            })
          })
        })
      })
      describe('Conviction data', () => {
        describe('Terms:', () => {
          describe('Expected none extended terms, lists key as "Sentence length" with the expected value', () => {
            const testTerm = 'Term unit test value'
            const testCases: { name: string; custodialTerm?: string; extendedTerm?: string }[] = [
              {
                name: 'Neither Custodial nor Extended term',
                custodialTerm: undefined,
                extendedTerm: undefined,
              },
              {
                name: 'Custodial but not Extended term',
                custodialTerm: testTerm,
                extendedTerm: undefined,
              },
              {
                name: 'Extended but not Custodial term',
                custodialTerm: undefined,
                extendedTerm: testTerm,
              },
            ]
            testCases.forEach(testCase => {
              it(`- ${testCase.name}`, async () => {
                const recommendationNotExtended = RecommendationResponseGenerator.generate({
                  convictionDetail: {
                    custodialTerm: testCase.custodialTerm,
                    extendedTerm: testCase.extendedTerm,
                  },
                })
                res.locals = {
                  ...res.locals,
                  recommendation: recommendationNotExtended,
                }

                const resultTerms = res.locals.pageData.convictionData.terms
                expect(resultTerms).toBeDefined()
                expect(resultTerms).toHaveLength(1)
                expect(resultTerms[0].key).toEqual('Sentence length')
                expect(resultTerms[0].value).toEqual(
                  `${defaultGetRecommendation.convictionDetail.lengthOfSentence} ${defaultGetRecommendation.convictionDetail.lengthOfSentenceUnits}`
                )
              })
            })
          })
          it('- Both a Custodial and Extended term, lists both of these with respective keys and expected value', async () => {
            const custodailTermValue = 'Unit test custodial term'
            const extendedTermValue = 'Unit test extended term'
            const recommendationIsExtended = RecommendationResponseGenerator.generate({
              convictionDetail: {
                custodialTerm: custodailTermValue,
                extendedTerm: extendedTermValue,
              },
            })
            res.locals = {
              ...res.locals,
              recommendation: recommendationIsExtended,
            }

            await selectIndexOffenceController.get(req, res, next)

            const resultTerms = res.locals.pageData.convictionData.terms
            expect(resultTerms).toBeDefined()
            expect(resultTerms).toHaveLength(2)
            expect(resultTerms[0].key).toEqual('Custodial term')
            expect(resultTerms[0].value).toEqual(custodailTermValue)
            expect(resultTerms[1].key).toEqual('Extended term')
            expect(resultTerms[1].value).toEqual(extendedTermValue)
          })
        })
      })
    })
  })

  describe('post', () => {
    const defaultPostRecommendation = RecommendationResponseGenerator.generate({
      nomisIndexOffence: { selectedIndex: 'none' },
    })
    const expectedSelectedOffence = defaultPostRecommendation.nomisIndexOffence.allOptions.at(0)
    const expectedSelectedOffenceIndex = expectedSelectedOffence.offenderChargeId
    const defaultPostSentence = PrisonSentenceGenerator.generate({
      offences: [{ offenderChargeId: expectedSelectedOffenceIndex }, {}, {}],
    })
    const defaultPostSentenceSequence: PrisonSentenceSequence = {
      indexSentence: defaultPostSentence,
      sentencesInSequence: null,
    }
    describe('Non conditional logic:', () => {
      const selecedtIndexReq = mockReq({
        originalUrl: 'some-url',
        params: { recommendationId: '123' },
        body: { indexOffence: expectedSelectedOffenceIndex.toString() },
      })
      const selectedIndexRes = mockRes({
        locals: {
          recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
          urlInfo: { basePath: `/recommendations/123/` },
        },
      })

      beforeEach(async () => {
        ;(prisonSentences as jest.Mock).mockResolvedValue([defaultPostSentenceSequence])
        ;(getRecommendation as jest.Mock).mockResolvedValue(defaultPostRecommendation)
        ;(updateRecommendation as jest.Mock).mockResolvedValue(defaultPostRecommendation)
        await selectIndexOffenceController.post(selecedtIndexReq, selectedIndexRes, next)
      })

      it('- Updates with the expected changes', async () =>
        expect(updateRecommendation).toHaveBeenCalledWith({
          featureFlags: {},
          recommendationId: '123',
          token: 'token',
          valuesToSave: {
            nomisIndexOffence: {
              selected: expectedSelectedOffenceIndex.toString(),
              allOptions: defaultPostRecommendation.nomisIndexOffence.allOptions,
            },
            bookRecallToPpud: {
              ...defaultPostRecommendation.bookRecallToPpud,
              sentenceDate: expectedSelectedOffence.sentenceDate,
            },
          },
        }))
      it('- Executes the next function', async () => expect(next).toHaveBeenCalled())
    })
    describe('Conditional logic:', () => {
      describe('No index offence provided', () => {
        const expectedOriginUrl = 'origin/url'
        const noIndexSelectedReq = mockReq({
          originalUrl: expectedOriginUrl,
          params: { recommendationId: '123' },
          body: {},
        })
        const noIndexSelectedRes = mockRes({
          locals: {
            recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
            urlInfo: { basePath: `/recommendations/123/` },
          },
        })
        beforeEach(async () => selectIndexOffenceController.post(noIndexSelectedReq, noIndexSelectedRes, next))
        it('- Redirects to the original url', async () =>
          expect(noIndexSelectedRes.redirect).toHaveBeenCalledWith(303, expectedOriginUrl))
        it('- Sets the expected eroor details on the request', async () =>
          expect(noIndexSelectedReq.session.errors).toEqual([
            {
              errorId: 'noIndexOffenceSelected',
              href: '#indexOffence',
              invalidParts: undefined,
              name: 'indexOffence',
              text: 'Select an index offence',
              values: undefined,
            },
          ]))
        it('- Does not execute the next function', async () => expect(next).not.toHaveBeenCalled())
      })
      describe('Navigation:', () => {
        const selectedOffenceIndex = faker.number.int()
        const recommonendationResponseForNavigationTests = RecommendationResponseGenerator.generate({
          nomisIndexOffence: {
            selectedIndex: 'none',
            offeredOffenceOptions: [{ offenderChargeId: selectedOffenceIndex }, {}, {}],
          },
        })
        const navigationReq = mockReq({
          body: { indexOffence: selectedOffenceIndex.toString() },
        })
        const navigationRes = mockRes({
          locals: {
            urlInfo: { basePath: '/recommendations/123/' },
          },
        })
        describe('When the selected offence does not have a consecutive sentence', () => {
          const nonConsecutiveSentence = PrisonSentenceSequenceGenerator.generate({
            indexSentence: {
              offences: [{ offenderChargeId: selectedOffenceIndex }, {}, {}],
            },
            sentencesInSequence: null,
          })
          beforeEach(async () => {
            ;(getRecommendation as jest.Mock).mockResolvedValue(recommonendationResponseForNavigationTests)
            ;(prisonSentences as jest.Mock).mockResolvedValue([nonConsecutiveSentence])
            await selectIndexOffenceController.post(navigationReq, navigationRes, next)
          })
          it('Then the user is navigated to the Match Index Offence page', async () => {
            expect(navigationRes.redirect).toHaveBeenCalledWith(303, '/recommendations/123/match-index-offence')
          })
        })
        describe('When the selected offence does have consecutive sentences', () => {
          const consecutiveSentence = PrisonSentenceSequenceGenerator.generate({
            indexSentence: {
              offences: [{ offenderChargeId: selectedOffenceIndex }, {}, {}],
            },
            sentencesInSequence: new Map([[1, [{}]]]),
          })
          beforeEach(async () => {
            ;(getRecommendation as jest.Mock).mockResolvedValue(recommonendationResponseForNavigationTests)
            ;(prisonSentences as jest.Mock).mockResolvedValue([consecutiveSentence])
            await selectIndexOffenceController.post(navigationReq, navigationRes, next)
          })
          it('Then the user is navigated to the Consecutive Sentence Details page', async () => {
            expect(navigationRes.redirect).toHaveBeenCalledWith(
              303,
              `/recommendations/123/${ppcsPaths.consecutiveSentenceDetails}`
            )
          })
        })
      })
    })
  })
})
