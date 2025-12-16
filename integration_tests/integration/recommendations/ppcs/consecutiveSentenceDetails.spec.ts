import { testSummaryList } from '../../../componentTests/summaryList.tests'
import { RECOMMENDATION_STATUS } from '../../../../server/middleware/recommendationStatus'
import { PrisonSentenceSequenceGenerator } from '../../../../data/prisonSentences/prisonSentenceSequenceGenerator'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { defaultUpdateRecommendationResponse } from '../_data'
import { CUSTODY_GROUP } from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { PrisonSentence } from '../../../../server/@types/make-recall-decision-api/models/PrisonSentence'
import { PrisonSentenceOptions } from '../../../../data/prisonSentences/prisonSentenceGenerator'
import { setUpSessionForPpcs } from './util'

context('Determinate Sentence - Consecutive/Concurrent Sentence Details Page', () => {
  const crn = 'X34983'
  const recommendationId = '123'

  const testPageUrl = `/recommendations/${recommendationId}/consecutive-sentence-details`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  const defaultRecommendationResponse = RecommendationResponseGenerator.generate({
    bookRecallToPpud: {
      custodyGroup: CUSTODY_GROUP.DETERMINATE,
    },
    nomisIndexOffence: {
      selectedIndex: 0,
    },
  })
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]
  const defaultPrisonSentenceSequence = PrisonSentenceSequenceGenerator.generateSeries([
    {
      indexSentence: {
        lineSequence: 1,
        sentenceSequence: 1,
        offences: [
          {
            offenderChargeId: defaultRecommendationResponse.nomisIndexOffence.selected,
          },
        ],
        terms: [{ chronos: { years: 'include', months: 'include', weeks: 'include', days: 'include' } }],
      },
      sentencesInSequence: new Map<number, Array<PrisonSentenceOptions>>([
        [
          1,
          [
            {
              lineSequence: 2,
              sentenceSequence: 2,
              terms: [{ chronos: { years: 'include', months: 'include', weeks: 'include', days: 'none' } }],
            },
          ],
        ],
        [
          2,
          [
            {
              lineSequence: 3,
              sentenceSequence: 3,
              terms: [{ chronos: { years: 'include', months: 'include', weeks: 'none', days: 'include' } }],
            },
            {
              lineSequence: 4,
              sentenceSequence: 4,
              terms: [{ chronos: { years: 'include', months: 'include', weeks: 'none', days: 'none' } }],
            },
          ],
        ],
        [
          3,
          [
            {
              lineSequence: 5,
              sentenceSequence: 5,
              terms: [
                { code: 'IMP', chronos: { years: 'include', months: 'include', weeks: 'include', days: 'include' } },
                { code: 'LIC', chronos: { years: 'include', months: 'include', weeks: 'include', days: 'include' } },
              ],
            },
          ],
        ],
        [
          5,
          [
            { lineSequence: 6, sentenceSequence: 6, terms: [] },
            { lineSequence: 7, sentenceSequence: 7 },
            { lineSequence: 8, sentenceSequence: 8 },
            { lineSequence: 9, sentenceSequence: 9 },
          ],
        ],
      ]),
    },
    {},
    {},
  ])
  const defaultExpectedSentenceSequence = defaultPrisonSentenceSequence.at(0)

  const expectedLabels = {
    indexOffence: 'Index offence',
    offence: 'Offence',
    sentenceType: 'Sentence type',
    court: 'Court',
    dateOfSentence: 'Date of sentence',
    startDate: 'Start date',
    expiryDate: 'Sentence expiry date',
    sentenceLength: 'Sentence length',
    impTerm: 'Custodial term',
    licTerm: 'Extended term',
  }

  describe('Page Data', () => {
    describe('Standard page load', () => {
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        cy.task('updateRecommendation', {
          statusCode: 200,
          response: defaultUpdateRecommendationResponse(crn, recommendationId),
        })
        cy.task('prisonSentences', { statusCode: 200, response: defaultPrisonSentenceSequence })

        cy.visit(testPageUrl)
      })

      it('Page Heading and pre-sentences body', () => {
        cy.pageHeading().should('contain', 'View the index offence and its consecutive sentences')
        cy.get('.govuk-body').should(
          'contain.text',
          'The index offence is the first sentence in the consecutive sequence.'
        )
        cy.get('h2').should('exist').should('contain', 'Offence sequence')
      })
      it('Continue link as button', () => {
        cy.get('a#continue')
          .should('exist')
          .should('have.class', 'govuk-button')
          .should('have.attr', 'role', 'button')
          .should('have.attr', 'href', `/recommendations/${recommendationId}/match-index-offence`)
      })

      describe('Sentence details', () => {
        it('Correct count of sentence details', () => {
          cy.get('.govuk-summary-list').should('have.length', 9)
        })

        it('Index sentence - correct summary details', () => {
          const term = defaultExpectedSentenceSequence.indexSentence.terms.at(0)
          const expectedSentenceLength = `${term.years} years, ${term.months} months, ${term.weeks} weeks, ${term.days} days`
          testSentenceSummaryDetails(
            'indexSentence',
            defaultExpectedSentenceSequence.indexSentence,
            expectedLabels.indexOffence,
            [{ key: expectedLabels.sentenceLength, value: expectedSentenceLength }]
          )
        })

        it('Consecutive sentence', () => {
          testConsecutiveGroup(1, 2, 'index', ['sentence-seq-1-initial'])
          const singleConsecutiveSentence = new Map(Object.entries(defaultExpectedSentenceSequence.sentencesInSequence))
            .get('1')
            .at(0)
          const term = singleConsecutiveSentence.terms.at(0)
          const expectedSentenceLength = `${term.years} years, ${term.months} months, ${term.weeks} weeks`
          testSentenceSummaryDetails('sentence-seq-1-initial', singleConsecutiveSentence, expectedLabels.offence, [
            { key: expectedLabels.sentenceLength, value: expectedSentenceLength },
          ])
        })

        it('Consecutive sentence - with single concurrent sentence', () => {
          testConsecutiveGroup(2, 3, 2, ['sentence-seq-2-initial', 'sentence-seq-2-1'])
          const concurrentSentences = new Map(Object.entries(defaultExpectedSentenceSequence.sentencesInSequence)).get(
            '2'
          )

          const firstConcurrentSentence = concurrentSentences.at(0)
          const firstSentenceTerm = firstConcurrentSentence.terms.at(0)
          const expectedFirstTimeSentenceLength = `${firstSentenceTerm.years} years, ${firstSentenceTerm.months} months, ${firstSentenceTerm.days} days`

          const secondConurrentSentence = concurrentSentences.at(1)
          const secondSentenceTerm = secondConurrentSentence.terms.at(0)
          const expectedSecondTimeSentenceLength = `${secondSentenceTerm.years} years, ${secondSentenceTerm.months} months`

          testSentenceSummaryDetails('sentence-seq-2-initial', firstConcurrentSentence, expectedLabels.offence, [
            { key: expectedLabels.sentenceLength, value: expectedFirstTimeSentenceLength },
          ])

          testConcurrentGroup(2, ['sentence-seq-2-1'])

          testSentenceSummaryDetails('sentence-seq-2-1', secondConurrentSentence, expectedLabels.offence, [
            { key: expectedLabels.sentenceLength, value: expectedSecondTimeSentenceLength },
          ])
        })

        it('Consecutive sentence - after concurrent sentences, correctly sequenced', () => {
          testConsecutiveGroup(3, 5, 3, ['sentence-seq-3-initial'])
          const singleConsecutiveSentence = new Map(Object.entries(defaultExpectedSentenceSequence.sentencesInSequence))
            .get('3')
            .at(0)
          const { terms } = singleConsecutiveSentence
          const impTerm = terms.at(0)
          const licTerm = terms.at(1)
          const expectedIMPTerm = `${impTerm.years} years, ${impTerm.months} months, ${impTerm.weeks} weeks, ${impTerm.days} days`
          const expectedLICTerm = `${licTerm.years} years, ${licTerm.months} months, ${licTerm.weeks} weeks, ${licTerm.days} days`

          testSentenceSummaryDetails('sentence-seq-3-initial', singleConsecutiveSentence, expectedLabels.offence, [
            { key: expectedLabels.impTerm, value: expectedIMPTerm },
            { key: expectedLabels.licTerm, value: expectedLICTerm },
          ])
        })

        it('Consecutive sentence - multiple concurrent sentences', () => {
          testConsecutiveGroup(4, 6, 5, [
            'sentence-seq-4-initial',
            'sentence-seq-4-1',
            'sentence-seq-4-2',
            'sentence-seq-4-3',
          ])
          const concurrentSentences = new Map(Object.entries(defaultExpectedSentenceSequence.sentencesInSequence)).get(
            '5'
          )

          const firstConcurrentSentence = concurrentSentences.at(0)
          const expectedFirstTimeSentenceLength = '-'

          const secondConurrentSentence = concurrentSentences.at(1)
          const secondSentenceTerm = secondConurrentSentence.terms.at(0)
          const expectedSecondTimeSentenceLength = `${secondSentenceTerm.years} years, ${secondSentenceTerm.months} months, ${secondSentenceTerm.weeks} weeks, ${secondSentenceTerm.days} days`

          const thirdConurrentSentence = concurrentSentences.at(2)
          const thirdSentenceTerm = thirdConurrentSentence.terms.at(0)
          const expectedThirdTimeSentenceLength = `${thirdSentenceTerm.years} years, ${thirdSentenceTerm.months} months, ${thirdSentenceTerm.weeks} weeks, ${thirdSentenceTerm.days} days`

          const fourthConurrentSentence = concurrentSentences.at(3)
          const fourthSentenceTerm = fourthConurrentSentence.terms.at(0)
          const expectedFourthTimeSentenceLength = `${fourthSentenceTerm.years} years, ${fourthSentenceTerm.months} months, ${fourthSentenceTerm.weeks} weeks, ${fourthSentenceTerm.days} days`

          testSentenceSummaryDetails('sentence-seq-4-initial', firstConcurrentSentence, expectedLabels.offence, [
            { key: expectedLabels.sentenceLength, value: expectedFirstTimeSentenceLength },
          ])

          testConcurrentGroup(4, ['sentence-seq-4-1', 'sentence-seq-4-2', 'sentence-seq-4-3'])

          testSentenceSummaryDetails('sentence-seq-4-1', secondConurrentSentence, expectedLabels.offence, [
            { key: expectedLabels.sentenceLength, value: expectedSecondTimeSentenceLength },
          ])
          testSentenceSummaryDetails('sentence-seq-4-2', thirdConurrentSentence, expectedLabels.offence, [
            { key: expectedLabels.sentenceLength, value: expectedThirdTimeSentenceLength },
          ])
          testSentenceSummaryDetails('sentence-seq-4-3', fourthConurrentSentence, expectedLabels.offence, [
            { key: expectedLabels.sentenceLength, value: expectedFourthTimeSentenceLength },
          ])
        })
      })
    })
  })

  const testSentenceSummaryDetails = (
    id: string,
    expectedSentence: PrisonSentence,
    expectedOffenceLabel: string,
    expectedTerms: { key: string; value: string }[]
  ) => {
    cy.get(`dl#${id}`).should('exist').as('sentenceSummary')
    testSummaryList(cy.get('@sentenceSummary'), {
      matchLength: true,
      rows: [
        { key: expectedOffenceLabel, value: expectedSentence.offences.at(0).offenceDescription },
        { key: expectedLabels.sentenceType, value: expectedSentence.sentenceTypeDescription },
        { key: expectedLabels.court, value: expectedSentence.courtDescription },
        { key: expectedLabels.dateOfSentence, value: expectedSentence.sentenceDate },
        { key: expectedLabels.startDate, value: expectedSentence.sentenceStartDate },
        { key: expectedLabels.expiryDate, value: expectedSentence.sentenceEndDate },
        ...expectedTerms,
      ],
    })
  }

  const testConsecutiveGroup = (
    index: number,
    titleSequenceLine: number,
    consecutiveTo: 'index' | number,
    expectedSummaryListIds: string[]
  ) => {
    cy.get(`#consecutive-group-${index}`)
      .should('exist')
      .should('have.class', 'govuk-inset-text')
      .as('consecutiveGroup')

    cy.get('@consecutiveGroup')
      .find(`div#consecutive-group-title-${consecutiveTo === 'index' ? 1 : consecutiveTo}`)
      .should('exist')
      .as('consecutiveTitle')

    cy.get('@consecutiveTitle').find('span').should('exist').should('have.text', `Sequence: line ${titleSequenceLine}`)
    cy.get('@consecutiveTitle')
      .find('p')
      .should('exist')
      .should('have.class', 'govuk-body-s')
      .should('have.text', `Consecutive to ${consecutiveTo === 'index' ? 'index offence' : `line ${consecutiveTo}`}`)

    expectedSummaryListIds.forEach(id => cy.get('@consecutiveGroup').find(`dl#${id}`).should('exist'))
  }

  const testConcurrentGroup = (index: number, expectedSummaryListIds: string[]) => {
    const expectedConcurrentSentenceCount = expectedSummaryListIds.length
    cy.get(`#consecutive-group-${index}`)
      .should('exist')
      .should('have.class', 'govuk-inset-text')
      .as('consecutiveGroup')

    cy.get('@consecutiveGroup').find('details.govuk-details').should('exist').as('details')

    cy.get('@details').find('summary').should('exist').as('summary')

    cy.get('@summary')
      .find('h3')
      .should('exist')
      .should('have.class', 'govuk-heading-s')
      .should(
        'contain.text',
        `${expectedConcurrentSentenceCount} concurrent sentence${expectedConcurrentSentenceCount > 1 ? 's' : ''}`
      )

    cy.get('@details').find('div.govuk-details__text').should('exist').as('content')

    cy.get('@details').should('not.have.attr', 'open')
    cy.get('@summary').click()
    cy.get('@details').should('have.attr', 'open')

    expectedSummaryListIds.forEach(id => {
      cy.get('@content').find(`dl#${id}`).should('exist')
    })
  }
})
