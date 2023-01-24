import { When } from '@badeball/cypress-cucumber-preprocessor'
import { DateTime } from 'luxon'

When('Maria views the no recall task list', () => {
  cy.pageHeading().should('equal', 'Create a decision not to recall letter')
})

When('Maria confirms why recall was considered', () => {
  cy.clickLink('Why you considered recall')
  cy.selectRadio('Why you considered recall', 'Contact with your probation practitioner has broken down')
  cy.clickButton('Continue')
})

When('Maria confirms why the person should not be recalled', function () {
  cy.fillInput("Explain the licence breach and why it's a problem", 'Breach details')
  cy.fillInput(`Explain your rationale for not recalling ${this.offenderName}`, 'Rationale details')
  cy.fillInput(`What progress has ${this.offenderName} made so far?`, 'Progress details')
  cy.fillInput('What is expected in the future?', 'Future details')
  cy.clickButton('Continue')
})

When('Maria enters details of the next appointment', () => {
  cy.selectRadio('How will the appointment happen?', 'Telephone')
  const nextYear = DateTime.now().year + 1
  cy.enterDateTime({
    day: '1',
    month: '2',
    year: nextYear.toString(),
    hour: '23',
    minute: '12',
  })
  cy.fillInput('Probation telephone', '07762906985')
  cy.clickButton('Continue')
})

When('Maria previews the decision not to recall letter', () => {
  cy.pageHeading().should('equal', 'Preview the decision not to recall letter')
  cy.getText('letter-date').should('not.be.empty')
  cy.getText('probation-address').should('equal', 'Probation office address')
  cy.getText('pop-salutation').should('contain', 'Dear')
  cy.getText('letter-title').should('equal', 'DECISION NOT TO RECALL')
  cy.getText('section-1').should(
    'contain',
    'you have breached your licence conditions in such a way that contact with your probation practitioner has broken down'
  )
  cy.getText('section-1').should('contain', 'Breach details')
  cy.getText('section-1').should('contain', 'Rationale details')
  cy.getText('section-1').should('contain', 'Progress details')
  cy.getText('section-1').should('contain', 'Future details')
  cy.getText('section-1').should('contain', 'Your next appointment is by telephone on')
  const nextYear = DateTime.now().year + 1
  cy.getText('section-2').should('contain', `1st February ${nextYear} at 11:12pm`)
  cy.getText('section-3').should('contain', 'please contact me by the following telephone number: 07762906985')
  cy.getText('signature').should('contain', 'Yours sincerely,')
  cy.clickLink('Continue')
})

When('Maria downloads the decision not to recall letter and confirms the details', () => {
  cy.clickLink('Create letter')
  cy.downloadDocX('Download the decision not to recall letter').then(contents => {
    expect(contents).to.contain('DECISION NOT TO RECALL')
  })
})
