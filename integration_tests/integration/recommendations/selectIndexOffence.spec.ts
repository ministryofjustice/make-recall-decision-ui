import { fakerEN_GB as faker } from '@faker-js/faker'
import { testSummaryList } from '../../componentTests/summaryList.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../componentTests/errors.tests'
import { PrisonSentenceGenerator } from '../../data/prisonSentences/prisonSentenceGenerator'
import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import { TermOptions } from '../../data/common/termGenerator'
import { SentenceOffenceOptions } from '../../data/prisonSentences/sentenceOffenceGenerator'
import searchMappedUserResponse from '../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../api/responses/ppudSearchActiveUsers.json'
import { RECOMMENDATION_STATUS } from '../../../server/middleware/recommendationStatus'
import { defaultUpdateRecommendationResponse } from './_data'
import { CUSTODY_GROUP } from '../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { PrisonSentence } from '../../../server/@types/make-recall-decision-api/models/PrisonSentence'
import { ConvictionDetail } from '../../../server/@types/make-recall-decision-api'

context('Select Index Offence Page', () => {
  const crn = 'X34983'
  const recommendationId = '123'

  const testPageUrl = '/recommendations/123456789/select-index-offence'

  beforeEach(() => {
    cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
    cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
    cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
  })

  const defaultRecommendationResponse = RecommendationResponseGenerator.generate({
    recallConsideredList: false,
    bookRecallToPpud: {
      custodyGroup: CUSTODY_GROUP.DETERMINATE,
    },
  })
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]
  const anyThreeOffencesOptions: SentenceOffenceOptions[] = [{}, {}, {}]
  const defaultPrisonSentence = PrisonSentenceGenerator.generate({
    sentenceType: 'Determinate',
    offences: anyThreeOffencesOptions,
  })

  describe('Page Data', () => {
    it('Standard page load', () => {
      cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: defaultUpdateRecommendationResponse(crn, recommendationId),
      })
      cy.task('prisonSentences', { statusCode: 200, response: [defaultPrisonSentence] })

      cy.visit(testPageUrl)

      // Page Heading
      const expectedName = `${defaultRecommendationResponse.bookRecallToPpud.firstNames} ${defaultRecommendationResponse.bookRecallToPpud.lastName}`
      cy.pageHeading().should('contain', `Select the index offence for ${expectedName}`)
      cy.get('.govuk-body').should('contain.text', 'Compare the offence details in NOMIS with the Part A')

      // Index offence Radio inputs
      cy.get('.govuk-form-group').should('have.length', 1).as('radioFormGroup')

      cy.get('@radioFormGroup').get('fieldset').as('radioFieldset')
      cy.get('@radioFieldset').get('legend').should('contain.html', 'h2').should('contain.text', 'NOMIS')
      cy.get('@radioFieldset')
        .get('#indexOffence-hint')
        .should('exist')
        .should('contain.html', 'p')
        .should('contain.text', 'Includes court cases, sentences and offences')

      cy.get('@radioFieldset').get('.govuk-radios').should('exist').as('radioGroup')

      cy.get('@radioGroup').get('div.govuk-radios__item').as('radios')
      cy.get('@radios').should('have.length', anyThreeOffencesOptions.length)
      cy.get('@radios').each((radio, index) => {
        const expectedOffence = defaultPrisonSentence.offences.at(index)
        const expectedInputId = `indexOffence-${index + 1}-input`
        const expectedHintId = `indexOffence-${index + 1}-input-item-hint`
        const expectedSummaryId = `indexOffence-${index + 1}-summary`

        cy.wrap(radio)
          .find('input')
          .should('exist')
          .should('have.id', expectedInputId)
          .should('have.value', expectedOffence.offenderChargeId)
          .should('have.attr', 'aria-describedby', expectedHintId)
        cy.wrap(radio)
          .find('label')
          .should('exist')
          .should('have.attr', 'for', expectedInputId)
          .should('contain.html', 'h3')
          .should('contain.text', expectedOffence.offenceDescription)
        cy.wrap(radio)
          .find(`div#${expectedHintId}`)
          .should('exist')
          .should('have.class', 'govuk-radios__hint')
          .should('contain.html', `dl id="${expectedSummaryId}"`)
        cy.wrap(radio).find(`dl#${expectedSummaryId}`).should('exist').as('hintSummaryList')
        const expectedTerm = `${defaultPrisonSentence.terms.at(0).years} years, ${defaultPrisonSentence.terms.at(0).months} months, ${defaultPrisonSentence.terms.at(0).weeks} weeks, ${defaultPrisonSentence.terms.at(0).days} days`
        testSummaryList(cy.get('@hintSummaryList'), {
          rows: {
            matchLength: false,
            expectedContent: [
              { key: 'Sentence type', value: defaultPrisonSentence.sentenceTypeDescription },
              { key: 'Court', value: defaultPrisonSentence.courtDescription },
              { key: 'Date of sentence', value: defaultPrisonSentence.sentenceDate },
              { key: 'Start date', value: defaultPrisonSentence.sentenceStartDate },
              { key: 'Sentence expiry date', value: defaultPrisonSentence.sentenceEndDate },
              { key: 'Sentence length', value: expectedTerm },
            ],
          },
        })
      })

      // Part A summary
      cy.get('#part-A-details').should('have.length', 1).as('partAGroup')

      cy.get('@partAGroup').find('h2').should('exist').should('have.text', 'Part A')
      cy.get('@partAGroup').find('p.govuk-body').should('exist').should('have.text', 'Index offence')
      cy.get('@partAGroup')
        .find('h3')
        .should('exist')
        .should('have.text', defaultRecommendationResponse.convictionDetail.indexOffenceDescription)
      cy.get('@partAGroup').find('dl').should('exist').as('partASummary')
      testSummaryList(cy.get('@partASummary'), {
        rows: {
          expectedContent: [
            { key: 'Date of sentence', value: defaultRecommendationResponse.convictionDetail.dateOfSentence },
            { key: 'Sentence type', value: defaultRecommendationResponse.convictionDetail.sentenceDescription },
            { key: 'Sentence expiry date', value: defaultRecommendationResponse.convictionDetail.sentenceExpiryDate },
            {
              key: 'Sentence length',
              value: `${defaultRecommendationResponse.convictionDetail.lengthOfSentence} ${defaultRecommendationResponse.convictionDetail.lengthOfSentenceUnits}`,
            },
          ],
        },
      })

      // Continue button
      cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
    })

    describe('Term variations', () => {
      const verifyAndRetrieveSingleNOMISRadioItem = () => {
        cy.get('.govuk-form-group').should('have.length', 1).as('radioFormGroup')
        cy.get('@radioFormGroup').get('fieldset').as('radioFieldset')
        cy.get('@radioFieldset').get('.govuk-radios').should('exist').as('radioGroup')
        cy.get('@radioGroup').get('div.govuk-radios__item').as('radios')
        cy.get('@radios').should('have.length', 1)
        return cy.get('@radios').first()
      }
      const testNOMISSummaryListForTermRows = (
        summaryList: Cypress.Chainable<JQuery<HTMLElement>>,
        termsRows: { key: string; value: string }[],
        sentence: PrisonSentence
      ) => {
        testSummaryList(summaryList, {
          rows: {
            matchLength: false,
            expectedContent: [
              { key: 'Sentence type', value: sentence.sentenceTypeDescription },
              { key: 'Court', value: sentence.courtDescription },
              { key: 'Date of sentence', value: sentence.sentenceDate },
              { key: 'Start date', value: sentence.sentenceStartDate },
              { key: 'Sentence expiry date', value: sentence.sentenceEndDate },
              ...termsRows,
            ],
          },
        })
      }
      it('Sentence with single term - displays as Sentence length', () => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        cy.task('updateRecommendation', {
          statusCode: 200,
          response: defaultUpdateRecommendationResponse(crn, recommendationId),
        })

        const anySingleTermOptions: TermOptions[] = ['all']
        const prisonSentenceWithSingleTerm = PrisonSentenceGenerator.generate({
          sentenceType: 'Determinate',
          offences: [{}],
          terms: anySingleTermOptions,
        })
        cy.task('prisonSentences', { statusCode: 200, response: [prisonSentenceWithSingleTerm] })

        cy.visit(testPageUrl)

        // Index offence Radio inputs
        const radio = verifyAndRetrieveSingleNOMISRadioItem()
        const hintSummaryList = radio.find(`dl`).should('exist')

        const expectedTerm = `${prisonSentenceWithSingleTerm.terms.at(0).years} years, ${prisonSentenceWithSingleTerm.terms.at(0).months} months, ${prisonSentenceWithSingleTerm.terms.at(0).weeks} weeks, ${prisonSentenceWithSingleTerm.terms.at(0).days} days`
        testNOMISSummaryListForTermRows(
          hintSummaryList,
          [{ key: 'Sentence length', value: expectedTerm }],
          prisonSentenceWithSingleTerm
        )
      })
      it('Sentence with multiple term - displays as resolved term based on code', () => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        cy.task('updateRecommendation', {
          statusCode: 200,
          response: defaultUpdateRecommendationResponse(crn, recommendationId),
        })

        const termsWithExpectedCodes: TermOptions[] = [{ code: 'IMP' }, { code: 'LIC' }]
        const prisonSentenceWithSingleTerm = PrisonSentenceGenerator.generate({
          sentenceType: 'Determinate',
          offences: [{}],
          terms: termsWithExpectedCodes,
        })
        cy.task('prisonSentences', { statusCode: 200, response: [prisonSentenceWithSingleTerm] })

        cy.visit(testPageUrl)

        // Index offence Radio inputs
        const radio = verifyAndRetrieveSingleNOMISRadioItem()
        const hintSummaryList = radio.find(`dl`).should('exist')

        const expectedCustodialTerm = `${prisonSentenceWithSingleTerm.terms.at(0).years} years, ${prisonSentenceWithSingleTerm.terms.at(0).months} months, ${prisonSentenceWithSingleTerm.terms.at(0).weeks} weeks, ${prisonSentenceWithSingleTerm.terms.at(0).days} days`
        const expectedExtendedTerm = `${prisonSentenceWithSingleTerm.terms.at(1).years} years, ${prisonSentenceWithSingleTerm.terms.at(1).months} months, ${prisonSentenceWithSingleTerm.terms.at(1).weeks} weeks, ${prisonSentenceWithSingleTerm.terms.at(1).days} days`
        testNOMISSummaryListForTermRows(
          hintSummaryList,
          [
            { key: 'Custodial term', value: expectedCustodialTerm },
            { key: 'Extended term', value: expectedExtendedTerm },
          ],
          prisonSentenceWithSingleTerm
        )
      })

      const verifyAndRetrievePartASummaryList = () => {
        cy.get('#part-A-details').should('have.length', 1).as('partAGroup')
        cy.get('@partAGroup').find('dl').should('exist').as('sumamryList')
        return cy.get('@sumamryList')
      }
      const testPartASummaryListForTermRows = (
        summaryList: Cypress.Chainable<JQuery<HTMLElement>>,
        termsRows: { key: string; value: string }[],
        convictionDetail: ConvictionDetail
      ) => {
        testSummaryList(summaryList, {
          rows: {
            expectedContent: [
              { key: 'Date of sentence', value: convictionDetail.dateOfSentence },
              { key: 'Sentence type', value: convictionDetail.sentenceDescription },
              { key: 'Sentence expiry date', value: convictionDetail.sentenceExpiryDate },
              ...termsRows,
            ],
          },
        })
      }
      it('Part A is not extended - displays as Sentence length using length of sentence', () => {
        const recommendationWithNonExtendedConviction = RecommendationResponseGenerator.generate({
          recallConsideredList: false,
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          convictionDetail: {
            custodialTerm: 'none',
            extendedTerm: 'none',
          },
        })
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNonExtendedConviction })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        cy.task('updateRecommendation', {
          statusCode: 200,
          response: defaultUpdateRecommendationResponse(crn, recommendationId),
        })
        cy.task('prisonSentences', { statusCode: 200, response: [defaultPrisonSentence] })

        cy.visit(testPageUrl)

        // Part A data summary
        const summaryList = verifyAndRetrievePartASummaryList()
        testPartASummaryListForTermRows(
          summaryList,
          [
            {
              key: 'Sentence length',
              value: `${recommendationWithNonExtendedConviction.convictionDetail.lengthOfSentence} ${recommendationWithNonExtendedConviction.convictionDetail.lengthOfSentenceUnits}`,
            },
          ],
          recommendationWithNonExtendedConviction.convictionDetail
        )
      })
      it('Part A is extended - displays as resolved term using conviction terms', () => {
        const recommendationWithExtendedConviction = RecommendationResponseGenerator.generate({
          recallConsideredList: false,
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
          convictionDetail: {
            custodialTerm: 'include',
            extendedTerm: 'include',
          },
        })
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithExtendedConviction })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        cy.task('updateRecommendation', {
          statusCode: 200,
          response: defaultUpdateRecommendationResponse(crn, recommendationId),
        })
        cy.task('prisonSentences', { statusCode: 200, response: [defaultPrisonSentence] })

        cy.visit(testPageUrl)

        // Part A data summary
        const summaryList = verifyAndRetrievePartASummaryList()
        testPartASummaryListForTermRows(
          summaryList,
          [
            { key: 'Custodial term', value: recommendationWithExtendedConviction.convictionDetail.custodialTerm },
            { key: 'Extended term', value: recommendationWithExtendedConviction.convictionDetail.extendedTerm },
          ],
          recommendationWithExtendedConviction.convictionDetail
        )
      })
    })

    describe('Consecutive sentence variations', () => {
      const testConsecutivePanelNotRendered = (panelId: string) => cy.get(`#${panelId}`).should('not.exist')
      const testConsecutivePanel = (panelId: string, groupLength: number) => {
        cy.get(`#${panelId}`).should('exist').as('consecutivePanel')
        cy.get('@consecutivePanel').should('contain.text', `${groupLength} consecutive sentences`)
        cy.get('@consecutivePanel').find('p.govuk-body-s').should('exist').and('have.text', 'More details on next page')
      }
      it('A sentence without consecutive group data - does not render a consecutive data panel', () => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        cy.task('updateRecommendation', {
          statusCode: 200,
          response: defaultUpdateRecommendationResponse(crn, recommendationId),
        })
        const prisonSentenceWithoutConsecutiveGroup = PrisonSentenceGenerator.generate()
        cy.task('prisonSentences', { statusCode: 200, response: [prisonSentenceWithoutConsecutiveGroup] })

        cy.visit(testPageUrl)

        testConsecutivePanelNotRendered('indexOffence-1-consecutive')
      })
      it('A sentence with consecutive group data - renders a consecutive data panel', () => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        cy.task('updateRecommendation', {
          statusCode: 200,
          response: defaultUpdateRecommendationResponse(crn, recommendationId),
        })
        const consecutiveGroup = [faker.number.int(), faker.number.int()]
        const prisonSentenceWithConsecutiveGroup = PrisonSentenceGenerator.generate({
          consecutiveGroup,
        })
        cy.task('prisonSentences', { statusCode: 200, response: [prisonSentenceWithConsecutiveGroup] })

        cy.visit(testPageUrl)

        testConsecutivePanel('indexOffence-1-consecutive', 2)
      })
    })
  })

  describe('Error messages', () => {
    const selectIndexOffenceErrorMessage = 'Select an index offence'
    it('When the form is submitted with no input - no index offence selected error display', () => {
      cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
      cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      cy.task('updateRecommendation', {
        statusCode: 200,
        response: defaultUpdateRecommendationResponse(crn, recommendationId),
      })
      cy.task('prisonSentences', { statusCode: 200, response: [defaultPrisonSentence] })

      cy.visit(testPageUrl)
      cy.get('button').click()

      testForErrorPageTitle()
      testForErrorSummary([{ href: 'indexOffence', message: selectIndexOffenceErrorMessage }])

      cy.get('div.govuk-form-group')
        .should('exist')
        .and('have.length', 1)
        .and('have.class', 'govuk-form-group--error')
        .as('indexOffenceFormGroup')
      cy.get('@indexOffenceFormGroup')
        .find('p#indexOffence-error')
        .should('exist')
        .and('have.class', 'govuk-error-message')
        .and('contain.text', selectIndexOffenceErrorMessage)
    })
  })
})
