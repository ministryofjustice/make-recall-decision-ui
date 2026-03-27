import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'

context('Police Contact Details', () => {
  const mockRecommendation = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${mockRecommendation.id}/police-details`

  beforeEach(() => {
    cy.task('getRecommendation', { statusCode: 200, response: mockRecommendation })
    cy.task('getStatuses', { statusCode: 200, response: [] })
    cy.signIn()
  })

  it('FTR56 OFF — shows all fields including telephone and fax', () => {
    cy.visit(`${testPageUrl}`)

    cy.getElement('Police contact name').should('exist')
    cy.getElement('Email address').should('exist')
    cy.getElement('Telephone number (optional)').should('exist')
    cy.getElement('Fax number (optional)').should('exist')
  })

  it('FTR56 ON — shows contact name and email, hides telephone and fax', () => {
    cy.visit(`${testPageUrl}?flagFTR56Enabled=1`)

    cy.getElement('Police contact name').should('exist')
    cy.getElement('Email address').should('exist')
    cy.getElement('Telephone number (optional)').should('not.exist')
    cy.getElement('Fax number (optional)').should('not.exist')
  })
})
