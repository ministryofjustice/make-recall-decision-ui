import { When } from 'cypress-cucumber-preprocessor/steps'

When('Maria views the no recall task list', () => {
  cy.pageHeading().should('equal', 'Create a decision not to recall letter')
})

When('Maria confirms why recall was considered', () => {
  cy.clickLink('Why you considered recall')
  cy.selectRadio('Why you considered recall', 'Contact with your probation practitioner has broken down')
  cy.clickButton('Continue')
})

When('Maria confirms why the person should not be recalled', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.fillInput("Explain the licence breach and why it's a problem", 'Breach details')
    cy.fillInput(`Explain your rationale for not recalling ${offenderName}`, 'Rationale details')
    cy.fillInput(`What progress has ${offenderName} made so far?`, 'Progress details')
    cy.fillInput('What is expected in the future?', 'Future details')
  })
  cy.clickButton('Continue')
})

When('Maria downloads the decision not to recall letter and confirms the details', () => {
  cy.clickLink('Create letter')
  cy.downloadDocX('Download the decision not to recall letter').then(contents => {
    expect(contents).to.contain('DECISION NOT TO RECALL')
  })
})
