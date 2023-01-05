import { defineStep, When } from '@badeball/cypress-cucumber-preprocessor'
import {
  q16IndexOffenceDetails,
  q1EmergencyRecall,
  q22RecallType,
  q25ProbationDetails,
  q2IndeterminateSentenceType,
  q3ExtendedSentence,
  q6CustodyStatus,
} from './assertionsPartA'

When('Maria downloads the Part A and confirms the fixed term recall', () => {
  return cy.downloadDocX('Download the Part A').then(contents => {
    q1EmergencyRecall(contents, 'No')
    q2IndeterminateSentenceType(contents, 'No')
    q3ExtendedSentence(contents, 'No')
    q6CustodyStatus(contents, 'Prison Custody')
    q16IndexOffenceDetails(contents)
    q22RecallType(contents, 'Fixed', 'Fixed term details...')
    cy.log('Q23')
    expect(contents).to.contain('Additional licence condition for fixed term recall...')
    cy.log('Q25')
    q25ProbationDetails(contents)
  })
})

When('Maria downloads the Part A and confirms the standard recall', () => {
  return cy.downloadDocX('Download the Part A').then(contents => {
    q22RecallType(contents, 'Standard', 'Standard details...')
  })
})

When('Maria adds licence conditions for the fixed term recall', () => {
  cy.log('========= Fixed term licence conditions')
  cy.selectRadio('Fixed term recall', 'Yes')
  cy.fillInput('Give details', 'Additional licence condition for fixed term recall...')
  cy.clickButton('Continue')
})

defineStep('Maria confirms {string} for emergency recall', (answer: string) => {
  cy.selectRadio('Is this an emergency recall?', answer)
  cy.clickButton('Continue')
})

When('Henry downloads the latest Part A and confirms the details have not been overwritten', () => {
  return cy.downloadDocX('Download Part A').then(contents => {
    cy.log('Q25')
    q25ProbationDetails(contents)
  })
})
