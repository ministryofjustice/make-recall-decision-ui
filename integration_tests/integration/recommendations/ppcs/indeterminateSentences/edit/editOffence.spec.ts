import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecommendationResponseGenerator } from '../../../../../../data/recommendations/recommendationGenerator'
import { CUSTODY_GROUP } from '../../../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { RECOMMENDATION_STATUS } from '../../../../../../server/middleware/recommendationStatus'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../../componentTests/errors.tests'
import { setUpSessionForPpcs } from '../../util'

context('Indeterminate Sentence - Edit Offence Page', () => {
  const recommendationId = '123'
  const autocompleteId = 'offenceDescription'
  const textAreaId = 'offenceDescriptionComment'

  const testPageUrl = `/recommendations/${recommendationId}/edit-offence`

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  const sentenceId = faker.number.int().toString()
  const ppudOffenceDescription = faker.lorem.sentence()
  const updatedPpudOffenceDescription = faker.lorem.sentence()
  const updatedPpudOffenceDescriptionComment = faker.lorem.sentences(4)
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  describe('Page Data', () => {
    describe('Initial page load', () => {
      const defaultRecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.INDETERMINATE,
          ppudSentenceId: sentenceId,
          ppudIndeterminateSentenceData: {
            offenceDescription: ppudOffenceDescription,
            offenceDescriptionComment: '',
          },
        },
        ppudOffender: {
          sentences: [{ id: sentenceId, offence: { indexOffence: ppudOffenceDescription } }],
        },
      })
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: defaultRecommendationResponse })
        cy.task('getReferenceList', {
          name: 'index-offences',
          statusCode: 200,
          response: { values: [ppudOffenceDescription, updatedPpudOffenceDescription, faker.lorem.sentence()] },
        })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })
      it('Loads the correct page data with empty inputs', () => {
        cy.visit(testPageUrl)
        testPageContent(
          true,
          autocompleteId,
          textAreaId,
          ppudOffenceDescription,
          updatedPpudOffenceDescription,
          updatedPpudOffenceDescriptionComment
        )
      })
    })
    describe('Page load after offence details have been changed', () => {
      const updatedRecommendationResponse = RecommendationResponseGenerator.generate({
        bookRecallToPpud: {
          custodyGroup: CUSTODY_GROUP.INDETERMINATE,
          ppudSentenceId: sentenceId,
          ppudIndeterminateSentenceData: {
            offenceDescription: updatedPpudOffenceDescription,
            offenceDescriptionComment: updatedPpudOffenceDescriptionComment,
          },
        },
        ppudOffender: {
          sentences: [{ id: sentenceId, offence: { indexOffence: ppudOffenceDescription } }],
        },
      })
      beforeEach(() => {
        cy.task('getRecommendation', { statusCode: 200, response: updatedRecommendationResponse })
        cy.task('getReferenceList', {
          name: 'index-offences',
          statusCode: 200,
          response: { values: [ppudOffenceDescription, updatedPpudOffenceDescription, faker.lorem.sentence()] },
        })
        cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
      })
      it('Loads the correct data with pre-filled inputs', () => {
        cy.visit(testPageUrl)
        testPageContent(
          false,
          autocompleteId,
          textAreaId,
          ppudOffenceDescription,
          updatedPpudOffenceDescription,
          updatedPpudOffenceDescriptionComment
        )
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
 * @param initial Is this the first page load?
 * @param autocompleteId The ID for the autocomplete form field
 * @param textAreaId The ID for the textArea form field
 * @param ppudOffenceDescription The index offence currently saved in PPUD
 * @param updatedPpudOffenceDescription The index offence selected by the user
 * @param updatedPpudOffenceDescriptionComment A comment about the index offence selected by the user
 */
function testPageContent(
  initial: boolean,
  autocompleteId: string,
  textAreaId: string,
  ppudOffenceDescription: string,
  updatedPpudOffenceDescription: string,
  updatedPpudOffenceDescriptionComment: string
) {
  // Page Headings and body content
  cy.pageHeading().should('contain', 'Edit offence')
  cy.get('.govuk-body').should('contain.text', 'Update the information to record in PPUD')

  cy.get('h2').should('have.class', 'govuk-heading-m').should('contain.text', 'Currently in PPUD')
  cy.get('p.govuk-body').should('contain.text', ppudOffenceDescription)

  setFormGroupAliases()

  cy.get('@offenceDescriptionSelectWrapper')
    .find('label')
    .should('exist')
    .should('have.class', 'govuk-label govuk-label--m')
    .should('contain.attr', 'for', autocompleteId)
    .should('contain.text', 'Select the offence')

  cy.get('@offenceDescriptionSelectWrapper').find('input').should('have.id', autocompleteId)

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

  if (initial) {
    cy.get('@offenceDescriptionSelectWrapper').find('input').should('have.value', '')
    cy.get('@offenceDescriptionCommentWrapper').find('textarea').should('have.value', '')
  } else {
    cy.get('@offenceDescriptionSelectWrapper').find('input').should('have.value', updatedPpudOffenceDescription)
    cy.get('@offenceDescriptionCommentWrapper')
      .find('textarea')
      .should('have.value', updatedPpudOffenceDescriptionComment)
  }

  // Continue button
  cy.get('button').should('have.class', 'govuk-button').should('contain.text', 'Continue')
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
