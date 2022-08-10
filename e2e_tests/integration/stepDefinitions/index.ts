import { When } from 'cypress-cucumber-preprocessor/steps'

export const crn = Cypress.env('CRN') || 'X098092'

When('Maria signs in', () => {
  cy.visitPage('/?flagRecommendationProd=1&flagRecommendationsPageProd=1')
})

When('Maria searches for a case', () => {
  cy.clickLink('Start now')
  cy.pageHeading().should('equal', 'Search for a person on probation')
  cy.fillInput('Search', crn)
  cy.clickButton('Search')
  cy.get(`[data-qa="row-${crn}"] [data-qa="name"]`).first().click().invoke('text').as('offenderName')
})

When('Maria views the overview page', () => {
  cy.get('@offenderName').then(offenderName => cy.getText('sectionHeading').should('equal', offenderName))
  cy.getText('lastReleaseDate').should('not.be.empty')
  cy.getText('licenceExpiryDate').should('not.be.empty')
})

When('Maria views the risk page', () => {
  cy.clickLink('Risk')
  cy.pageHeading().should('contain', 'Risk')
})

When('Maria views the personal details page', () => {
  cy.clickLink('Personal details')
  cy.pageHeading().should('contain', 'Personal details')
})

When('Maria views the licence conditions page', () => {
  cy.clickLink('Licence conditions')
  cy.pageHeading().should('contain', 'Licence conditions')
})

When('Maria views the Contact history page', () => {
  cy.clickLink('Contact history')
  cy.pageHeading().should('contain', 'Contact history')
})

When('Maria filters contacts by date range', () => {
  cy.get('.app-summary-card')
    .its('length')
    .then(numberOfContacts => {
      cy.getElement(`${numberOfContacts} contacts`).should('exist')
    })
  cy.enterDateTime('2022-03-13', { parent: '#dateFrom' })
  cy.enterDateTime('2022-04-13', { parent: '#dateTo' })
  cy.clickButton('Apply filters')
  cy.getLinkHref('13 Mar 2022 to 13 Apr 2022').should('equal', `/cases/${crn}/contact-history`)
})

When('Maria starts a new recommendation', () => {
  cy.clickLink('Recommendations')
  cy.get('body').then($body => {
    if ($body.find('[data-qa="delete-recommendation"]').length) {
      cy.clickButton('Delete')
    }
  })
  cy.clickButton('Make a recommendation')
})

When('Maria recommends a fixed term recall', () => {
  cy.selectRadio('What do you recommend?', 'Fixed term recall')
  cy.fillInput('Why do you recommend this recall type?', 'Details...')
  cy.clickButton('Continue')
})

When('Maria selects a custody status', () => {
  cy.selectRadio('Is the person in custody now?', 'Yes, police custody')
  cy.clickButton('Continue')
})

When('Maria sees a confirmation page', () => {
  cy.pageHeading().should('contain', 'Part A created')
})

When('Maria downloads the Part A', () => {
  cy.downloadDocX('Download the Part A').then(contents => {
    cy.log('Q6')
    expect(contents).to.contain('Is the offender currently in police custody or prison custody? Police Custody')
    cy.log('Q22')
    expect(contents).to.contain('Select the proposed recall type, having considered the information above: Standard')
    expect(contents).to.contain('Explain your reasons for the above recall type recommendation: Details...')
  })
})

When('Maria updates the recommendation', () => {
  cy.clickLink('Back to case overview')
  // check saved values
  cy.pageHeading().should('contain', 'Overview')
  cy.clickLink('Update recommendation')
  cy.getRadioOptionByLabel('What do you recommend?', 'Fixed term recall').should('be.checked')
  cy.clickButton('Continue')
  cy.getRadioOptionByLabel('Is the person in custody now?', 'Yes, police custody').should('be.checked')
})
