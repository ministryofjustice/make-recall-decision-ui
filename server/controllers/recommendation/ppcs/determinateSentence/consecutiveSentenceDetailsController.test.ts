import { Response } from 'express'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import { PrisonSentenceSequenceGenerator } from '../../../../../data/prisonSentences/prisonSentenceSequenceGenerator'
import { prisonSentences } from '../../../../data/makeDecisionApiClient'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import consecutiveSentenceDetailsController from './consecutiveSentenceDetailsController'
import { PrisonSentence } from '../../../../@types/make-recall-decision-api/models/PrisonSentence'
import { RecommendationResponse, Term } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { PrisonSentenceSequence } from '../../../../@types/make-recall-decision-api/models/prison-api/PrisonSentenceSequence'
import { TermGenerator } from '../../../../../data/common/termGenerator'
import { ppcsPaths } from '../../../../routes/paths/ppcs'

jest.mock('../../../../data/makeDecisionApiClient')

const next = mockNext()

type SentenceInfo = {
  lineSequence: number
  offence: string
  sentenceType: string
  court: string
  dateOfSentence: string
  startDate: string
  sentenceExpiryDate: string
  sentenceLength?: { key: string; value: Term }[]
}

describe('Consecutive Sentence Details Controller', () => {
  describe('get', () => {
    const defaultGetRecommendation = RecommendationResponseGenerator.generate({
      nomisIndexOffence: {
        selectedIndex: 0,
      },
    })
    const defaultGetSelectedIndex = defaultGetRecommendation.nomisIndexOffence.selected
    const defaultGetSentenceSequence = PrisonSentenceSequenceGenerator.generateSeries([
      {
        indexSentence: {
          offences: [
            {
              offenderChargeId: defaultGetSelectedIndex,
            },
          ],
        },
        sentencesInSequence: new Map([
          [1, [{}, {}]],
          [2, [{}]],
        ]),
      },
    ])
    const req = mockReq()
    const res = mockRes({
      locals: {
        recommendation: defaultGetRecommendation,
        urlInfo: {
          basePath: '/recommendations/123/',
        },
      },
    })
    describe('Non conditional logic:', () => {
      beforeEach(async () => {
        ;(prisonSentences as jest.Mock).mockResolvedValue(defaultGetSentenceSequence)
        await consecutiveSentenceDetailsController.get(req, res, next)
      })
      const expectedInfoForSentence = (sentence: PrisonSentence) =>
        ({
          lineSequence: sentence.lineSequence,
          offence: sentence.offences.at(0).offenceDescription,
          sentenceType: sentence.sentenceTypeDescription,
          court: sentence.courtDescription,
          dateOfSentence: sentence.sentenceDate,
          startDate: sentence.sentenceStartDate,
          sentenceExpiryDate: sentence.sentenceEndDate,
        }) as SentenceInfo

      it('- Prison Sentences correctly called', async () =>
        expect(prisonSentences).toHaveBeenCalledWith('token', defaultGetRecommendation.personOnProbation.nomsNumber))
      it('- Calls render for the expected page', async () =>
        expect(res.render).toHaveBeenCalledWith(
          `pages/recommendations/ppcs/determinateSentence/consecutiveSentences/consecutiveSentenceDetails`
        ))
      it('- Executes the next function', async () => expect(next).toHaveBeenCalled())

      describe('Res locals', () => {
        describe('Page Data:', () => {
          it('- Is provided', async () => expect(res.locals.pageData).toBeDefined())
          describe('Sentence Info:', () => {
            it('- Is provided', async () => expect(res.locals.pageData.sentenceInfo).toBeDefined())
            const testSentenceInfo = (expected: SentenceInfo, actual: (res: Response) => SentenceInfo) => {
              it('- Line sequence', async () => expect(actual(res).lineSequence).toEqual(expected.lineSequence))
              it('- Offence', async () => expect(actual(res).offence).toEqual(expected.offence))
              it('- Sentence type', async () => expect(actual(res).sentenceType).toEqual(expected.sentenceType))
              it('- Court', async () => expect(actual(res).court).toEqual(expected.court))
              it('- Date of sentence', async () => expect(actual(res).dateOfSentence).toEqual(expected.dateOfSentence))
              it('- Date of sentence', async () => expect(actual(res).startDate).toEqual(expected.startDate))
              it('- Sentence expiry date', async () =>
                expect(actual(res).sentenceExpiryDate).toEqual(expected.sentenceExpiryDate))
              it('- Sentence length (to be defined, conditional)', async () =>
                expect(actual(res).sentenceLength).toBeDefined())
            }
            describe('Index offence:', () => {
              it('- Is provided', async () => expect(res.locals.pageData.sentenceInfo.indexSentence).toBeDefined())
              describe('Maps non-conditiomal as expected:', () => {
                describe('Index offence:', () => {
                  const expectedIndexInfo = expectedInfoForSentence(defaultGetSentenceSequence.at(0).indexSentence)
                  const actualIndexInfo = (response: Response) => response.locals.pageData.sentenceInfo.indexSentence
                  testSentenceInfo(expectedIndexInfo, actualIndexInfo)
                })
              })
            })
            describe('Sentences in sequence:', () => {
              it('- Is provided', async () =>
                expect(res.locals.pageData.sentenceInfo.sentencesInSequence).toBeDefined())
              describe('Maps non-conditiomal as expected:', () => {
                new Map(Object.entries(defaultGetSentenceSequence.at(0).sentencesInSequence)).forEach(
                  (sentences, consecTo) => {
                    describe(`Consecutive to group: ${consecTo}`, () => {
                      sentences.forEach((sentence, i) => {
                        describe(`Sentence ${i + 1}`, () => {
                          const expectedSentenceInfo = expectedInfoForSentence(sentence)
                          const actualSentenceInfo = (response: Response) =>
                            (response.locals.pageData.sentenceInfo.sentencesInSequence as Map<string, SentenceInfo[]>)
                              .get(consecTo)
                              .at(i)
                          testSentenceInfo(expectedSentenceInfo, actualSentenceInfo)
                        })
                      })
                    })
                  }
                )
              })
            })
          })
        })
      })
    })
    describe('Conditional logic', () => {
      describe('Sentence in sequence is optional:', () => {
        it('Is null on Sentence Info when it is null on the Prison Sentence Sequence', async () => {
          const noSentenceInSequence = PrisonSentenceSequenceGenerator.generate({
            indexSentence: {
              offences: [
                {
                  offenderChargeId: defaultGetSelectedIndex,
                },
              ],
            },
            sentencesInSequence: null,
          })

          expect(noSentenceInSequence.sentencesInSequence).toBeNull()
          ;(prisonSentences as jest.Mock).mockResolvedValue([noSentenceInSequence])
          await consecutiveSentenceDetailsController.get(req, res, next)

          expect(res.locals.pageData.sentenceInfo.sentencesInSequence).toBeNull()
        })
      })
      describe('NOMIS error message', () => {
        const expectedErrorMessage = 'No sentences found'
        const setSentencesAndCall = async (sentenceSequences: PrisonSentenceSequence[]) => {
          ;(prisonSentences as jest.Mock).mockResolvedValue(sentenceSequences)
          await consecutiveSentenceDetailsController.get(req, res, next)
        }
        it('- Is not set when sentences are provided', async () => {
          await setSentencesAndCall(defaultGetSentenceSequence)
          expect(res.locals.pageData.nomisError).toBeUndefined()
          expect(res.locals.pageData.sentenceInfo).toBeDefined()
        })
        const noSentenceTestCases: { name: string; value: PrisonSentenceSequence[] }[] = [
          { name: 'undefined', value: undefined },
          { name: 'null', value: null },
          { name: 'empty', value: [] },
        ]
        noSentenceTestCases.forEach(({ name, value }) => {
          it(`- Is set as expected with ${name} sentences are provided`, async () => {
            await setSentencesAndCall(value)
            expect(res.locals.pageData.nomisError).toBeDefined()
            expect(res.locals.pageData.nomisError).toEqual(expectedErrorMessage)
            expect(res.locals.pageData.sentenceInfo).toBeNull()
          })
        })
      })
      describe('Resolving terms:', () => {
        it('- Single term, lists key as "Sentence length" with the expected value', async () => {
          const sentenceWithSingleTerm = PrisonSentenceSequenceGenerator.generate({
            indexSentence: {
              offences: [
                {
                  offenderChargeId: defaultGetSelectedIndex,
                },
              ],
              terms: [{}],
            },
          })

          expect(sentenceWithSingleTerm.indexSentence.terms).toHaveLength(1)
          ;(prisonSentences as jest.Mock).mockResolvedValue([sentenceWithSingleTerm])
          await consecutiveSentenceDetailsController.get(req, res, next)

          expect(res.locals.pageData.sentenceInfo.indexSentence.sentenceLength).toEqual([
            {
              key: 'Sentence length',
              value: sentenceWithSingleTerm.indexSentence.terms[0],
            },
          ])
        })
        it('- No terms, lists ket as "Sentence length" with an empty value', async () => {
          const sentenceWithNoTerms = PrisonSentenceSequenceGenerator.generate({
            indexSentence: {
              offences: [
                {
                  offenderChargeId: defaultGetSelectedIndex,
                },
              ],
              terms: [],
            },
          })

          expect(sentenceWithNoTerms.indexSentence.terms).toHaveLength(0)
          ;(prisonSentences as jest.Mock).mockResolvedValue([sentenceWithNoTerms])
          await consecutiveSentenceDetailsController.get(req, res, next)

          expect(res.locals.pageData.sentenceInfo.indexSentence.sentenceLength).toEqual([
            {
              key: 'Sentence length',
              value: {},
            },
          ])
        })
        describe('Multiple terms, lists key based on the term code with the expected value:', () => {
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
          const sentenceWithMultipleTerms = PrisonSentenceSequenceGenerator.generate({
            indexSentence: {
              offences: [
                {
                  offenderChargeId: defaultGetSelectedIndex,
                },
              ],
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
            },
          })

          beforeEach(async () => {
            expect(sentenceWithMultipleTerms.indexSentence.terms.length).not.toBeLessThan(2)
            ;(prisonSentences as jest.Mock).mockResolvedValue([sentenceWithMultipleTerms])
            await consecutiveSentenceDetailsController.get(req, res, next)
          })
          it('- IMP Term: Custodial', async () => {
            const term = res.locals.pageData.sentenceInfo.indexSentence.sentenceLength[0]
            expect(term.key).toEqual('Custodial term')
            expect(term.value).toEqual(termIMP)
          })
          it('- LIC Term: Extended', async () => {
            const term = res.locals.pageData.sentenceInfo.indexSentence.sentenceLength[1]
            expect(term.key).toEqual('Extended term')
            expect(term.value).toEqual(termLIC)
          })
        })
      })
      describe('Res locals', () => {
        describe('Page Data:', () => {
          describe('Next Page Path:', () => {
            const testCases: {
              useCaseDescription: string
              recommendation: RecommendationResponse
              redirectionPageId: string
            }[] = [
              {
                useCaseDescription: 'When no PPUD offender was selected',
                recommendation: RecommendationResponseGenerator.generate({
                  nomisIndexOffence: {
                    selectedIndex: 0,
                  },
                  ppudOffender: 'none',
                }),
                redirectionPageId: ppcsPaths.matchIndexOffence,
              },
              {
                useCaseDescription: 'When a PPUD offender with no sentences was selected',
                recommendation: RecommendationResponseGenerator.generate({
                  nomisIndexOffence: {
                    selectedIndex: 0,
                  },
                  ppudOffender: {
                    sentences: [],
                  },
                }),
                redirectionPageId: ppcsPaths.matchIndexOffence,
              },
              {
                useCaseDescription: 'When a PPUD offender with sentences was selected',
                recommendation: RecommendationResponseGenerator.generate({
                  nomisIndexOffence: {
                    selectedIndex: 0,
                  },
                }),
                redirectionPageId: ppcsPaths.selectPpudSentence,
              },
            ]
            const basePath = '/recommendations/123/'
            it.each(testCases)('$useCaseDescription', async ({ recommendation, redirectionPageId }) => {
              ;(prisonSentences as jest.Mock).mockResolvedValue(defaultGetSentenceSequence)
              const resForTestCase = mockRes({
                locals: {
                  recommendation,
                  urlInfo: {
                    basePath,
                  },
                },
              })
              await consecutiveSentenceDetailsController.get(req, resForTestCase, next)

              expect(resForTestCase.locals.pageData.nextPagePath).toBeDefined()
              expect(resForTestCase.locals.pageData.nextPagePath).toEqual(`${basePath}${redirectionPageId}`)
            })
          })
        })
      })
    })
  })
})
