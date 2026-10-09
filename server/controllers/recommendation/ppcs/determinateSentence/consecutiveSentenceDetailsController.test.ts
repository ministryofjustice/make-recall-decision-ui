import { Response } from 'express'
import { RecommendationResponseGenerator } from '../../../../../data/recommendations/recommendationGenerator'
import { PrisonSentenceSequenceGenerator } from '../../../../../data/prisonSentences/prisonSentenceSequenceGenerator'
import { prisonSentences, updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import consecutiveSentenceDetailsController from './consecutiveSentenceDetailsController'
import { PrisonSentence } from '../../../../@types/make-recall-decision-api/models/PrisonSentence'
import { RecommendationResponse, Term } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { PrisonSentenceSequence } from '../../../../@types/make-recall-decision-api/models/prison-api/PrisonSentenceSequence'
import { TermGenerator } from '../../../../../data/common/termGenerator'
import ppcsPaths from '../../../../routes/paths/ppcs.paths'

jest.mock('../../../../data/makeDecisionApiClient')

const next = mockNext()

type SentenceInfo = {
  lineSequence: number
  offence: string
  sentenceType: string
  court: string
  dateOfSentence: string
  startDate: string
  sentenceSequenceExpiryDate?: string
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
          offence: sentence.offences?.[0].offenceDescription,
          sentenceType: sentence.sentenceTypeDescription,
          court: sentence.courtDescription,
          dateOfSentence: sentence.sentenceDate,
          startDate: sentence.sentenceStartDate,
          sentenceSequenceExpiryDate: sentence.sentenceSequenceExpiryDate,
        }) as SentenceInfo

      it('- Prison Sentences correctly called', async () =>
        expect(prisonSentences).toHaveBeenCalledWith('token', defaultGetRecommendation.personOnProbation.nomsNumber))
      it('- Calls render for the expected page', async () =>
        expect(res.render).toHaveBeenCalledWith(
          `pages/recommendations/ppcs/determinateSentence/consecutiveSentences/consecutiveSentenceDetails`,
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
              it('- Start date', async () => expect(actual(res).startDate).toEqual(expected.startDate))
              it('- Sentence expiry date', async () =>
                expect(actual(res).sentenceSequenceExpiryDate).toEqual(expected.sentenceSequenceExpiryDate))
              it('- Sentence length (to be defined, conditional)', async () =>
                expect(actual(res).sentenceLength).toBeDefined())
            }
            describe('Index offence:', () => {
              it('- Is provided', async () => expect(res.locals.pageData.sentenceInfo.indexSentence).toBeDefined())
              describe('Maps non-conditiomal as expected:', () => {
                describe('Index offence:', () => {
                  const expectedIndexInfo = expectedInfoForSentence(defaultGetSentenceSequence?.[0].indexSentence)
                  const actualIndexInfo = (response: Response) => response.locals.pageData.sentenceInfo.indexSentence
                  testSentenceInfo(expectedIndexInfo, actualIndexInfo)
                })
              })
            })
            describe('Sentences in sequence:', () => {
              it('- Is provided', async () =>
                expect(res.locals.pageData.sentenceInfo.sentencesInSequence).toBeDefined())
              describe('Maps non-conditiomal as expected:', () => {
                new Map(Object.entries(defaultGetSentenceSequence?.[0].sentencesInSequence)).forEach(
                  (sentences, consecTo) => {
                    describe(`Consecutive to group: ${consecTo}`, () => {
                      sentences.forEach((sentence, i) => {
                        describe(`Sentence ${i + 1}`, () => {
                          const expectedSentenceInfo = expectedInfoForSentence(sentence)
                          const actualSentenceInfo = (response: Response) =>
                            (
                              response.locals.pageData.sentenceInfo.sentencesInSequence as Map<string, SentenceInfo[]>
                            ).get(consecTo)?.[i]
                          testSentenceInfo(expectedSentenceInfo, actualSentenceInfo)
                        })
                      })
                    })
                  },
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
        it('- No terms, lists key as "Sentence length" with an empty value', async () => {
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
      describe('Total sentence length:', () => {
        beforeEach(() => {
          ;(prisonSentences as jest.Mock).mockResolvedValue(defaultGetSentenceSequence)
        })
        it('- Uses the saved value when there are no unsaved values', async () => {
          const recommendation = RecommendationResponseGenerator.generate({
            nomisIndexOffence: { selectedIndex: 0 },
          })
          recommendation.bookRecallToPpud.totalSentenceLength = { partYears: 2, partMonths: 3, partDays: 10 }
          const resForTest = mockRes({ locals: { recommendation, urlInfo: { basePath: '/recommendations/123/' } } })
          await consecutiveSentenceDetailsController.get(req, resForTest, next)

          expect(resForTest.locals.pageData.totalSentenceLength).toEqual({ years: 2, months: 3, days: 10 })
        })
        it('- Is empty when nothing saved', async () => {
          const recommendation = RecommendationResponseGenerator.generate({
            nomisIndexOffence: { selectedIndex: 0 },
          })
          recommendation.bookRecallToPpud.totalSentenceLength = undefined
          const resForTest = mockRes({ locals: { recommendation, urlInfo: { basePath: '/recommendations/123/' } } })
          await consecutiveSentenceDetailsController.get(req, resForTest, next)

          expect(resForTest.locals.pageData.totalSentenceLength).toEqual({
            years: undefined,
            months: undefined,
            days: undefined,
          })
        })
        it('- Prefers unsaved values (after a validation error)', async () => {
          const unsaved = { years: '1', months: '', days: 'x' }
          const resForTest = mockRes({
            locals: {
              recommendation: defaultGetRecommendation,
              urlInfo: { basePath: '/recommendations/123/' },
              unsavedValues: { totalSentenceLength: unsaved },
            },
          })
          await consecutiveSentenceDetailsController.get(req, resForTest, next)

          expect(resForTest.locals.pageData.totalSentenceLength).toEqual(unsaved)
        })
      })
    })
  })

  describe('post', () => {
    const basePath = '/recommendations/123/'
    const originalUrl = '/recommendations/123/consecutive-sentence-details'

    const callPost = async (body: Record<string, string>, recommendation?: RecommendationResponse) => {
      const rec =
        recommendation ??
        RecommendationResponseGenerator.generate({
          nomisIndexOffence: { selectedIndex: 0 },
        })
      const req = mockReq({ params: { recommendationId: '123' }, body, originalUrl })
      const res = mockRes({ locals: { recommendation: rec, urlInfo: { basePath } } })
      await consecutiveSentenceDetailsController.post(req, res, next)
      return { req, res, rec }
    }

    beforeEach(() => {
      ;(updateRecommendation as jest.Mock).mockReset()
      ;(updateRecommendation as jest.Mock).mockResolvedValue({})
    })

    describe('Valid input', () => {
      it('- Saves the total sentence length and redirects to select PPUD sentence', async () => {
        const { res, rec } = await callPost({ years: '2', months: '0', days: ' 14 ' })

        expect(updateRecommendation).toHaveBeenCalledWith({
          recommendationId: '123',
          valuesToSave: {
            bookRecallToPpud: {
              ...rec.bookRecallToPpud,
              totalSentenceLength: { partYears: 2, partMonths: 0, partDays: 14 },
            },
          },
          token: 'token',
          featureFlags: {},
        })
        expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppcsPaths.selectPpudSentence}`)
      })
      it('- Redirects to match index offence when the PPUD offender has no sentences', async () => {
        const rec = RecommendationResponseGenerator.generate({
          nomisIndexOffence: { selectedIndex: 0 },
          ppudOffender: { sentences: [] },
        })
        const { res } = await callPost({ years: '0', months: '0', days: '0' }, rec)

        expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${ppcsPaths.matchIndexOffence}`)
      })
    })

    describe('Invalid input', () => {
      const testCases: {
        description: string
        body: Record<string, string>
        expected: { href: string; text: string; errorId: string }[]
      }[] = [
        {
          description: 'all parts empty',
          body: { years: '', months: '', days: '' },
          expected: [
            {
              href: '#totalSentenceLength-years',
              text: 'Enter the years, months and days. Enter ‘0’ if there is no years, months or days',
              errorId: 'missingTotalSentenceLength',
            },
          ],
        },
        {
          description: 'years missing',
          body: { years: '', months: '1', days: '1' },
          expected: [
            {
              href: '#totalSentenceLength-years',
              text: 'Enter the years. Enter ‘0’ if there are no years',
              errorId: 'missingTotalSentenceLengthYears',
            },
          ],
        },
        {
          description: 'months missing',
          body: { years: '1', months: ' ', days: '1' },
          expected: [
            {
              href: '#totalSentenceLength-months',
              text: 'Enter the months. Enter ‘0’ if there are no months',
              errorId: 'missingTotalSentenceLengthMonths',
            },
          ],
        },
        {
          description: 'days missing',
          body: { years: '1', months: '1', days: '' },
          expected: [
            {
              href: '#totalSentenceLength-days',
              text: 'Enter the days. Enter ‘0’ if there are no days',
              errorId: 'missingTotalSentenceLengthDays',
            },
          ],
        },
        {
          description: 'months and days missing',
          body: { years: '1', months: '', days: '' },
          expected: [
            {
              href: '#totalSentenceLength-months',
              text: 'Enter the months. Enter ‘0’ if there are no months',
              errorId: 'missingTotalSentenceLengthMonths',
            },
            {
              href: '#totalSentenceLength-days',
              text: 'Enter the days. Enter ‘0’ if there are no days',
              errorId: 'missingTotalSentenceLengthDays',
            },
          ],
        },
        {
          description: 'non-numeric values',
          body: { years: 'a', months: '-1', days: '1.5' },
          expected: [
            {
              href: '#totalSentenceLength-years',
              text: 'Years must be a whole number, like 2',
              errorId: 'invalidTotalSentenceLengthYears',
            },
            {
              href: '#totalSentenceLength-months',
              text: 'Months must be a whole number, like 6',
              errorId: 'invalidTotalSentenceLengthMonths',
            },
            {
              href: '#totalSentenceLength-days',
              text: 'Days must be a whole number, like 14',
              errorId: 'invalidTotalSentenceLengthDays',
            },
          ],
        },
      ]

      it.each(testCases)('- $description', async ({ body, expected }) => {
        const { req, res } = await callPost(body)

        expect(updateRecommendation).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith(303, originalUrl)
        expect(req.session.errors).toEqual(
          expected.map(e => expect.objectContaining({ href: e.href, text: e.text, errorId: e.errorId })),
        )
        expect(req.session.unsavedValues).toEqual({
          totalSentenceLength: {
            years: body.years.trim(),
            months: body.months.trim(),
            days: body.days.trim(),
          },
        })
      })
    })
  })
})
