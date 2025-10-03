import { fakerEN_GB as faker } from '@faker-js/faker'
import searchMappedUserResponse from '../../../../../../api/responses/searchMappedUsers.json'
import searchActiveUsersResponse from '../../../../../../api/responses/ppudSearchActiveUsers.json'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import { CUSTODY_GROUP } from '../../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RECOMMENDATION_STATUS } from '../../../../../../server/middleware/recommendationStatus'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../../componentTests/errors.tests'

context('Indeterminate Sentence - Edit Sentencing Court Page', () => {
  const recommendationId = '123'
  const autocompleteId = 'sentencingCourt'

  const testPageUrl = `/recommendations/${recommendationId}/edit-sentencing-court`

  beforeEach(() => {
    cy.session('login', () => {
      cy.task('searchMappedUsers', { statusCode: 200, response: searchMappedUserResponse })
      cy.task('ppudSearchActiveUsers', { statusCode: 200, response: searchActiveUsersResponse })
      cy.signIn({ roles: ['ROLE_MAKE_RECALL_DECISION_PPCS'] })
    })
  })

  const sentenceId = faker.number.int().toString()
  const ppudSentencingCourt = `${faker.location.city()} Court`
  const updatedPpudSentencingCourt = `${faker.location.city()} Court`
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  describe('Page Data', () => {
    describe('Initial page load', () => {
      const defaultRecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.INDETERMINATE,
          ppudSentenceId: sentenceId,
          ppudIndeterminateSentenceData: {
            sentencingCourt: ppudSentencingCourt,
          },
        },
        ppudOffender: {
          sentences: [{ id: sentenceId, sentencingCourt: ppudSentencingCourt }],
        },
      })
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getReferenceList', {
          name: 'courts',
          statusCode: 200,
          response: { values: [ppudSentencingCourt, updatedPpudSentencingCourt, `${faker.location.city()} Court`] },
        })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })
      it('Loads the correct page data with empty inputs', () => {
        cy.visit(testPageUrl)
        testPageContent(true, autocompleteId, ppudSentencingCourt, updatedPpudSentencingCourt)
      })
    })
    describe('Page load after court details have been changed', () => {
      const updatedRecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.INDETERMINATE,
          ppudSentenceId: sentenceId,
          ppudIndeterminateSentenceData: {
            sentencingCourt: updatedPpudSentencingCourt,
          },
        },
        ppudOffender: {
          sentences: [{ id: sentenceId, sentencingCourt: ppudSentencingCourt }],
        },
      })
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: updatedRecommendationResponse })
        cy.task('getReferenceList', {
          name: 'courts',
          statusCode: 200,
          response: { values: [ppudSentencingCourt, ppudSentencingCourt, updatedPpudSentencingCourt] },
        })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })
      it('Loads the correct data with pre-filled inputs', () => {
        cy.visit(testPageUrl)
        testPageContent(false, autocompleteId, ppudSentencingCourt, updatedPpudSentencingCourt)
      })
    })
  })

  describe('Error messages', () => {
    describe('Invalid submission', () => {
      it('No court selected', () => {
        cy.visit(testPageUrl)
        setFormGroupAliases()
        cy.get('@sentencingCourtSelectWrapper').find('input').clear()
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
 * @param initial Is this the first page load?
 * @param autocompleteId The ID for the autocomplete form field
 * @param ppudSentencingCourt The sentencing court currently saved in PPUD
 * @param updatedPpudSentencingCourt The sentencing court selected by the user
 */
function testPageContent(
  initial: boolean,
  autocompleteId: string,
  ppudSentencingCourt: string,
  updatedPpudSentencingCourt: string
) {
  // Page Headings and body content
  cy.pageHeading().should('contain', 'Edit sentencing court')
  cy.get('.govuk-body').should('contain.text', 'Update the information to record in PPUD')

  cy.get('h2').should('have.class', 'govuk-heading-m').should('contain.text', 'Currently in PPUD')
  cy.get('p.govuk-body').should('contain.text', ppudSentencingCourt)

  setFormGroupAliases()

  cy.get('@sentencingCourtSelectWrapper')
    .find('label')
    .should('exist')
    .should('have.class', 'govuk-label govuk-label--m')
    .should('contain.attr', 'for', autocompleteId)
    .should('contain.text', 'Select the sentencing court')

  cy.get('@sentencingCourtSelectWrapper').find('input').should('have.id', autocompleteId)

  if (initial) {
    cy.get('@sentencingCourtSelectWrapper').find('input').should('have.value', '')
  } else {
    cy.get('@sentencingCourtSelectWrapper').find('input').should('have.value', updatedPpudSentencingCourt)
  }

  // Continue button
  cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
}

/**
 * Get all the form groups within the sentencingCourtEditForm and assign them appropriate aliases
 */
function setFormGroupAliases() {
  // Get the form
  cy.get('form').as('sentencingCourtEditForm')

  cy.get('@sentencingCourtEditForm').within(() => {
    cy.get('.govuk-form-group').each((el, index) => {
      if (index === 0) {
        cy.wrap(el).as('sentencingCourtSelectWrapper')
      }
    })
  })
}
