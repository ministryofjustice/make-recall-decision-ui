import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, prisonSentences, updateRecommendation } from '../../data/makeDecisionApiClient'
import selectIndexOffenceController from './selectIndexOffenceController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { PrisonSentence } from '../../@types/make-recall-decision-api/models/PrisonSentence'
import { ConvictionDetail } from '../../@types/make-recall-decision-api'

jest.mock('../../data/makeDecisionApiClient')

const recommendationId = 123

const defaultRecommendation = {
  id: recommendationId,
  bookRecallToPpud: {
    firstNames: 'Joe',
    lastName: 'Bloggs',
  },
  convictionDetail: {
    indexOffenceDescription: 'offence description',
    dateOfSentence: '2015-01-01',
    lengthOfSentence: 5,
    lengthOfSentenceUnits: 'years',
    sentenceDescription: 'sentence description',
    sentenceExpiryDate: '2016-01-01',
  },
  personOnProbation: {
    croNumber: '123X',
    nomsNumber: '567Y',
    surname: 'Mayer',
    dateOfBirth: '2001-01-01',
    mappa: {
      level: '1',
    },
  },
}

const defaultSentence: PrisonSentence = {
  bookingId: 13,
  sentenceSequence: 1,
  lineSequence: 1,
  caseSequence: 1,
  courtDescription: 'Blackburn County Court',
  sentenceStatus: 'A',
  sentenceCategory: '2003',
  sentenceCalculationType: 'MLP',
  sentenceTypeDescription: 'Adult Mandatory Life',
  sentenceDate: '2023-11-16',
  sentenceStartDate: '2023-11-16',
  sentenceEndDate: '3022-11-15',
  releaseDate: '2025-11-16',
  licenceExpiryDate: '2025-11-17',
  releasingPrison: 'Broad Moor',
  terms: [{ years: 1, months: 0, weeks: 2, days: 3, code: 'UnitTest' }],
  offences: [
    {
      offenderChargeId: 3934369,
      offenceStartDate: '1899-01-01',
      offenceStatute: 'SA96',
      offenceCode: 'SA96036',
      offenceDescription:
        'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
      indicators: [],
    },
  ],
}

const expectedDefaultSentenceOptions = [
  {
    bookingId: 13,
    courtDescription: 'Blackburn County Court',
    offenceCode: 'SA96036',
    offenceDate: '1899-01-01',
    offenceDescription:
      'Sing / shout / play a musical instrument / operate a portable music machine cause annoyance at Stansted Airport London',
    offenceStatute: 'SA96',
    offenderChargeId: 3934369,
    sentenceDate: '2023-11-16',
    sentenceEndDate: '3022-11-15',
    sentenceStartDate: '2023-11-16',
    sentenceTypeDescription: 'Adult Mandatory Life',
    terms: [{ years: 1, months: 0, weeks: 2, days: 3, code: 'UnitTest' }],
    releaseDate: '2025-11-16',
    licenceExpiryDate: '2025-11-17',
    releasingPrison: 'Broad Moor',
  },
]

const expectedNomisOffenceData = {
  id: defaultSentence.offences[0].offenderChargeId,
  description: defaultSentence.offences[0].offenceDescription,
  sentenceType: defaultSentence.sentenceTypeDescription,
  court: defaultSentence.courtDescription,
  dateOfSentence: defaultSentence.sentenceDate,
  startDate: defaultSentence.sentenceStartDate,
  endDate: defaultSentence.sentenceEndDate,
}

const expectedConvictionData = {
  description: defaultRecommendation.convictionDetail.indexOffenceDescription,
  dateOfSentence: defaultRecommendation.convictionDetail.dateOfSentence,
  sentenceType: defaultRecommendation.convictionDetail.sentenceDescription,
  sentenceExpiryDate: defaultRecommendation.convictionDetail.sentenceExpiryDate,
}

const expectedErrorMessage = 'No sentences found'

const req = mockReq({
  params: { recommendationId: '123' },
})

const res = mockRes({
  locals: {
    recommendation: defaultRecommendation,
  },
})

const next = mockNext()

describe('get', () => {
  describe('Non conditional logic:', () => {
    beforeEach(async () => {
      ;(prisonSentences as jest.Mock).mockResolvedValue([defaultSentence])
      await selectIndexOffenceController.get(req, res, next)
    })

    it('- Prison Sentences correctly called', async () =>
      expect(prisonSentences).toHaveBeenCalledWith('token', defaultRecommendation.personOnProbation.nomsNumber))
    it('- Update Recommendation is called with the expected snapshot of options', async () =>
      expect(updateRecommendation).toHaveBeenCalledWith({
        featureFlags: {},
        recommendationId: recommendationId.toString(),
        token: 'token',
        valuesToSave: {
          nomisIndexOffence: {
            selected: undefined,
            allOptions: expectedDefaultSentenceOptions,
          },
        },
      }))
    it('- Calls render for the expected page', async () =>
      expect(res.render).toHaveBeenCalledWith(`pages/recommendations/selectIndexOffence`))
    it('- Executes the next function', async () => expect(next).toHaveBeenCalled())

    describe('Res locals:', () => {
      describe('Page:', () => {
        it('- Is provided', async () => expect(res.locals).toBeDefined())
        it('- Correct id', async () => {
          expect(res.locals.page).toBeDefined()
          expect(res.locals.page.id).toEqual('selectIndexOffence')
        })
      })

      describe('Page Data:', () => {
        it('- Is provided', async () => expect(res.locals.pageData).toBeDefined())
        describe('Offender name:', () => {
          it('- Correct value', async () => expect(res.locals.pageData.offenderName).toEqual('Frederick Mayer'))
        })
        describe('Nomis Offence Data', () => {
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
          it(' - terms (to be defined, conditional)', async () => expect(offenceData().id).toBeDefined)
          it(' - consecutiveCount (to be undefined, conditional)', async () => expect(offenceData().id).toBeUndefined)
        })
        describe('Conviction data', () => {
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
      const setSentencesAndCall = async (sentences: PrisonSentence[]) => {
        ;(prisonSentences as jest.Mock).mockResolvedValue(sentences)
        await selectIndexOffenceController.get(req, res, next)
      }
      it('- Is not set when sentences are provided', async () => {
        await setSentencesAndCall([defaultSentence])
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
          const sentenceWithSingleTerm = {
            ...defaultSentence,
          }

          expect(sentenceWithSingleTerm.terms).toHaveLength(1)
          ;(prisonSentences as jest.Mock).mockResolvedValue([sentenceWithSingleTerm])
          await selectIndexOffenceController.get(req, res, next)

          expect(res.locals.pageData.nomisOffenceData[0].terms).toEqual([
            {
              key: 'Sentence length',
              value: sentenceWithSingleTerm.terms[0],
            },
          ])
        })
        describe('Multiple terms, lists key based on the term code with the expected value', () => {
          const termIMP = { code: 'IMP', years: 1, months: 2, weeks: 3, days: 4 }
          const termLIC = { code: 'LIC', years: 4, months: 3, weeks: 2, days: 1 }
          const sentenceWithMultipleTerms = {
            ...defaultSentence,
            terms: [termIMP, termLIC],
          }

          beforeEach(async () => {
            expect(sentenceWithMultipleTerms.terms.length).not.toBeLessThan(2)
            ;(prisonSentences as jest.Mock).mockResolvedValue([sentenceWithMultipleTerms])
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
        it('- Has no value when no the sentence has no consecutive group', async () => {
          ;(prisonSentences as jest.Mock).mockResolvedValue([
            {
              ...defaultSentence,
              consecutiveGroup: undefined,
            },
          ])
          await selectIndexOffenceController.get(req, res, next)

          expect(res.locals.pageData.nomisOffenceData[0].consecutiveCount).toBeUndefined()
        })
        describe('Has the expected value of the consecutive groups length when provided', () => {
          ;[
            { consecutiveGroup: [1], expectedValue: 1 },
            { consecutiveGroup: [1, 2], expectedValue: 2 },
            { consecutiveGroup: [1, 2, 3, 5, 10], expectedValue: 5 },
            { consecutiveGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], expectedValue: 10 },
          ].forEach(testCase => {
            it(`Consecutive group: [${testCase.consecutiveGroup}] - Result: ${testCase.expectedValue}`, async () => {
              ;(prisonSentences as jest.Mock).mockResolvedValue([
                {
                  ...defaultSentence,
                  consecutiveGroup: testCase.consecutiveGroup,
                },
              ])
              await selectIndexOffenceController.get(req, res, next)

              expect(res.locals.pageData.nomisOffenceData[0].consecutiveCount).toEqual(testCase.expectedValue)
            })
          })
        })
      })
    })
    describe('Conviction data', () => {
      describe('Terms:', () => {
        describe('Expected none extended terms, lists key as "Sentence length" with the expected value', () => {
          const testTerm = 'Term unit test value'
          const testCases: { name: string; termsTransformer: (detail: ConvictionDetail) => ConvictionDetail }[] = [
            {
              name: 'Neither Custodial nor Extended term',
              termsTransformer: (detail: ConvictionDetail) => ({
                ...detail,
                custodialTerm: undefined,
                extendedTerm: undefined,
              }),
            },
            {
              name: 'Custodial but not Extended term',
              termsTransformer: (detail: ConvictionDetail) => ({
                ...detail,
                custodialTerm: testTerm,
                extendedTerm: undefined,
              }),
            },
            {
              name: 'Extended but not Custodial term',
              termsTransformer: (detail: ConvictionDetail) => ({
                ...detail,
                custodialTerm: undefined,
                extendedTerm: testTerm,
              }),
            },
          ]
          testCases.forEach(testCase => {
            it(`- ${testCase.name}`, async () => {
              const recommendationNotExtended = {
                ...defaultRecommendation,
                convictionDetail: testCase.termsTransformer(defaultRecommendation.convictionDetail),
              }
              res.locals = {
                ...res.locals,
                recommendation: recommendationNotExtended,
              }

              const resultTerms = res.locals.pageData.convictionData.terms
              expect(resultTerms).toBeDefined()
              expect(resultTerms).toHaveLength(1)
              expect(resultTerms[0].key).toEqual('Sentence length')
              expect(resultTerms[0].value).toEqual('5 years')
            })
          })
        })
        it('- Both a Custodial and Extended term, lists both of these with respective keys and expected value', async () => {
          const custodailTermValue = 'Unit test custodial term'
          const extendedTermValue = 'Unit test extended term'
          const recommendationIsExtended = {
            ...defaultRecommendation,
            convictionDetail: {
              ...defaultRecommendation.convictionDetail,
              custodialTerm: custodailTermValue,
              extendedTerm: extendedTermValue,
            },
          }
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
  it('select index offence', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      nomisIndexOffence: {
        allOptions: [
          {
            offenderChargeId: 1234,
            releaseDate: '2039-12-01',
            sentenceDate: '2019-01-20',
          },
        ],
      },
      bookRecallToPpud: {
        mappaLevel: 'Mappa Level 1',
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const selecedtIndexReq = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: { indexOffence: '1234' },
    })

    const selectedIndexRes = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await selectIndexOffenceController.post(selecedtIndexReq, selectedIndexRes, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        nomisIndexOffence: {
          allOptions: [
            {
              offenderChargeId: 1234,
              releaseDate: '2039-12-01',
              sentenceDate: '2019-01-20',
            },
          ],
          selected: '1234',
        },
        bookRecallToPpud: {
          mappaLevel: 'Mappa Level 1',
          sentenceDate: '2019-01-20',
        },
      },
    })
    expect(selectedIndexRes.redirect).toHaveBeenCalledWith(303, `/recommendations/123/match-index-offence`)
    expect(next).toHaveBeenCalled()
  })
  it('missing index offence', async () => {
    const noIndexSelectedReq = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {},
    })

    const noIndexSelectedRes = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await selectIndexOffenceController.post(noIndexSelectedReq, noIndexSelectedRes, next)
    expect(noIndexSelectedRes.redirect).toHaveBeenCalledWith(303, `some-url`)

    expect(noIndexSelectedReq.session.errors).toEqual([
      {
        errorId: 'noIndexOffenceSelected',
        href: '#indexOffence',
        invalidParts: undefined,
        name: 'indexOffence',
        text: 'Select an index offence',
        values: undefined,
      },
    ])
    expect(next).not.toHaveBeenCalled()
  })
})
