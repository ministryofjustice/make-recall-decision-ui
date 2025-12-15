import { fakerEN_GB as faker } from '@faker-js/faker'
import searchMappedUserResponse from '../../../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../../../api/responses/ppudSearchActiveUsers.json'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import { CUSTODY_GROUP } from '../../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { ppcsPaths } from '../../../../../../server/routes/paths/ppcs'
import { routes } from '../../../../../../api/routes'
import { RECOMMENDATION_STATUS } from '../../../../../../server/middleware/recommendationStatus'
import { formatDateTimeFromIsoString } from '../../../../../../server/utils/dates/formatting'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../../componentTests/errors.tests'
import {
  OfferedOffence,
  PpudSentence,
} from '../../../../../../server/@types/make-recall-decision-api/models/RecommendationResponse'

context('Determinate sentence - match index offence page', () => {
  const recommendationId = faker.number.int({ min: 1 })
  const autocompleteId = 'indexOffence'
  const textAreaId = 'indexOffenceComment'

  const testPageUrl = `${routes.recommendations}/${recommendationId}/${ppcsPaths.matchIndexOffence}`

  beforeEach(() => {
    cy.session('login', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    })
  })

  const ppudIndexOffenceReferenceListResponse = { values: faker.helpers.multiple(() => faker.lorem.sentence()) }

  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  describe('Page Data', () => {
    beforeEach(() => {
      cy.task('getReferenceList', {
        name: 'index-offences',
        statusCode: 200,
        response: ppudIndexOffenceReferenceListResponse,
      })
    })
    describe('Initial page load', () => {
      // We only test the ADD_NEW case here, as for existing PPUD sentences the offence details in
      // bookRecallToPpud are pre-populated from the selected PPUD sentence, so there is no scenario
      const recommendationWithNoMatchingDone = RecommendationResponseGenerator.generate({
        id: recommendationId,
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.DETERMINATE,
          ppudSentenceId: 'ADD_NEW',
        },
      })
      const selectedNomisOffence = recommendationWithNoMatchingDone.nomisIndexOffence.allOptions.find(
        o => o.offenderChargeId === recommendationWithNoMatchingDone.nomisIndexOffence.selected
      )
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: recommendationWithNoMatchingDone })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })

      it('Loads the correct page data with empty inputs', () => {
        cy.visit(testPageUrl)
        testPageContent(autocompleteId, textAreaId, ppudIndexOffenceReferenceListResponse.values, selectedNomisOffence)
      })
    })

    describe('Page load after offence details have been set', () => {
      describe('New sentence being added to PPUD', () => {
        const updatedPpudOffenceDescription = faker.helpers.arrayElement(ppudIndexOffenceReferenceListResponse.values)
        const updatedPpudOffenceDescriptionComment = faker.lorem.sentences()
        const recommendationWithMatchingDone = RecommendationResponseGenerator.generate({
          id: recommendationId,
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            ppudSentenceId: 'ADD_NEW',
            indexOffence: updatedPpudOffenceDescription,
            indexOffenceComment: updatedPpudOffenceDescriptionComment,
          },
        })
        const selectedNomisOffence = recommendationWithMatchingDone.nomisIndexOffence.allOptions.find(
          o => o.offenderChargeId === recommendationWithMatchingDone.nomisIndexOffence.selected
        )
        beforeEach(() => {
          cy.task('getRecommendation', { statusCode: 200, response: recommendationWithMatchingDone })
          cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        })
        it('Loads the correct page data with the correct input selected', () => {
          cy.visit(testPageUrl)
          testPageContent(
            autocompleteId,
            textAreaId,
            ppudIndexOffenceReferenceListResponse.values,
            selectedNomisOffence,
            null,
            updatedPpudOffenceDescription,
            updatedPpudOffenceDescriptionComment
          )
        })
      })
      describe('Existing PPUD sentence being updated', () => {
        const updatedPpudOffenceDescription = faker.helpers.arrayElement(ppudIndexOffenceReferenceListResponse.values)
        const updatedPpudOffenceDescriptionComment = faker.lorem.sentences()
        const recommendationWithMatchingDone = RecommendationResponseGenerator.generate({
          id: recommendationId,
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
            indexOffence: updatedPpudOffenceDescription,
            indexOffenceComment: updatedPpudOffenceDescriptionComment,
          },
        })
        const selectedNomisOffence = recommendationWithMatchingDone.nomisIndexOffence.allOptions.find(
          o => o.offenderChargeId === recommendationWithMatchingDone.nomisIndexOffence.selected
        )
        const selectedPpudOffence = faker.helpers.arrayElement(recommendationWithMatchingDone.ppudOffender.sentences)
        recommendationWithMatchingDone.bookRecallToPpud.ppudSentenceId = selectedPpudOffence.id

        beforeEach(() => {
          cy.task('getRecommendation', { statusCode: 200, response: recommendationWithMatchingDone })
          cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
        })
        it('Loads the correct page data with the correct input selected', () => {
          cy.visit(testPageUrl)
          testPageContent(
            autocompleteId,
            textAreaId,
            ppudIndexOffenceReferenceListResponse.values,
            selectedNomisOffence,
            selectedPpudOffence,
            updatedPpudOffenceDescription,
            updatedPpudOffenceDescriptionComment
          )
        })
      })
    })
  })

  describe('Error messages', () => {
    describe('Invalid submission', () => {
      it('No offence selected', () => {
        cy.visit(testPageUrl)
        setFormGroupAliases()
        cy.get('@offenceDescriptionSelectWrapper').find('input').clear()
        cy.get('button').click()
        testForErrorPageTitle()
        testForErrorSummary([{ href: `${autocompleteId}` }])
      })
    })
  })
})

// Helper functions

/**
 *
 * Test that all the page content is displayed as expected
 *
 * @param autocompleteId The ID for the autocomplete form field
 * @param textAreaId The ID for the textArea form field
 * @param ppudOffenceOptions The list of index offence options from PPUD
 * @param selectedNomisOffence The offence selected from NOMIS
 * @param selectedPpudSentence The sentence selected from PPUD
 * @param updatedPpudOffenceDescription The index offence selected by the user
 * @param updatedPpudOffenceDescriptionComment A comment about the index offence selected by the user
 */
function testPageContent(
  autocompleteId: string,
  textAreaId: string,
  ppudOffenceOptions: string[],
  selectedNomisOffence: OfferedOffence,
  selectedPpudSentence?: PpudSentence,
  updatedPpudOffenceDescription?: string,
  updatedPpudOffenceDescriptionComment?: string
) {
  const isNewSentence = !selectedPpudSentence

  // Page Headings and body content
  cy.pageHeading().should(
    'contain',
    isNewSentence ? 'Select a matching index offence in PPUD' : 'Change index offence or add a comment'
  )

  if (isNewSentence) {
    cy.get('.govuk-body').should(
      'contain.text',
      'You need to select an offence because the offences listed in PPUD and NOMIS do not match.'
    )

    cy.get('.govuk-inset-text')
      .should('have.class', 'guidance-panel')
      .should('contain.text', 'You selected this offence from NOMIS:')
      .should('contain.text', selectedNomisOffence.offenceDescription)
      .should('contain.text', 'Date of sentence')
      .should(
        'contain.text',
        formatDateTimeFromIsoString({
          isoDate: selectedNomisOffence.sentenceStartDate,
          dateOnly: true,
        })
      )
      .should('contain.text', 'Sentence expiry date')
      .should(
        'contain.text',
        formatDateTimeFromIsoString({
          isoDate: selectedNomisOffence.sentenceEndDate,
          dateOnly: true,
        })
      )
  } else {
    setTextListAliases()

    cy.get('@nomisOffenceDetailsList').find('h2').should('contain.text', 'From NOMIS')
    cy.get('@nomisOffenceDetailsList')
      .find('.govuk-text-list__row')
      .should('contain.text', 'Offence')
      .should('contain.text', selectedNomisOffence.offenceDescription)

    cy.get('@ppudOffenceDetailsList').find('h2').should('contain.text', 'From PPUD')
    cy.get('@ppudOffenceDetailsList')
      .find('.govuk-text-list__row')
      .should('contain.text', 'Offence')
      .should('contain.text', selectedPpudSentence.offence.indexOffence)
  }

  setFormGroupAliases()

  cy.get('@offenceDescriptionSelectWrapper')
    .find('label')
    .should('exist')
    .should('have.class', 'govuk-label')
    .should('contain.attr', 'for', autocompleteId)
    .should(
      'contain.text',
      isNewSentence
        ? 'Now select the nearest matching offence from the list in PPUD'
        : 'Select the nearest matching offence from the list in PPUD'
    )

  cy.get('@offenceDescriptionSelectWrapper').find('input').should('have.id', autocompleteId)

  ppudOffenceOptions.forEach((ppudIndexOffence, i) => {
    cy.get('@offenceDescriptionSelectWrapper')
      .find('option')
      .eq(i + 1) // the accessible-autocomplete component adds a default empty first option
      .should('contain.text', ppudIndexOffence)
  })

  cy.get('@offenceDescriptionCommentWrapper')
    .find('label')
    .should('exist')
    .should('have.class', 'govuk-label')
    .should('contain.attr', 'for', textAreaId)
    .should('contain.text', 'Add comments, including any additional offences (optional)')

  cy.get('@offenceDescriptionCommentWrapper')
    .find('textarea')
    .should('have.id', textAreaId)
    .should('have.attr', 'name', textAreaId)

  cy.get('@offenceDescriptionSelectWrapper')
    .find('input')
    .should('have.value', updatedPpudOffenceDescription ?? '')
  cy.get('@offenceDescriptionCommentWrapper')
    .find('textarea')
    .should('have.value', updatedPpudOffenceDescriptionComment ?? '')

  // Continue button
  cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
}

/**
 * Get all the text lists on the page and assign them appropriate aliases
 */
function setTextListAliases() {
  cy.get('.govuk-text-list').each((textList, index) => {
    if (index === 0) {
      cy.wrap(textList).as('nomisOffenceDetailsList')
    } else if (index === 1) {
      cy.wrap(textList).as('ppudOffenceDetailsList')
    }
  })
}

/**
 * Get all the form groups within the offenceEditForm and assign them appropriate aliases
 */
function setFormGroupAliases() {
  // Get the form
  cy.get('form').as('offenceEditForm')

  // The first form element should be the select, the second should be the comment textarea
  cy.get('@offenceEditForm').within(() => {
    cy.get('.govuk-form-group').each((el, index) => {
      if (index === 0) {
        cy.wrap(el).as('offenceDescriptionSelectWrapper')
      } else if (index === 1) {
        cy.wrap(el).as('offenceDescriptionCommentWrapper')
      }
    })
  })
}
