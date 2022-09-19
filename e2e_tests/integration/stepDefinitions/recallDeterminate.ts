import { defineStep, When } from 'cypress-cucumber-preprocessor/steps'
import {
  assertQ1_emergency_recall,
  assertQ22_recall_type,
  assertQ2_indeterminate_sentence_type,
  assertQ3_extended_sentence, assertQ6_custody_status,
} from './index'

When('Maria downloads the Part A and confirms the fixed term recall', () => {
  cy.downloadDocX('Download the Part A').then(contents => {
    assertQ1_emergency_recall(contents, 'No')
    assertQ2_indeterminate_sentence_type(contents, 'No')
    assertQ3_extended_sentence(contents, 'No')
    assertQ6_custody_status(contents, 'Prison Custody')
    assertQ22_recall_type(contents, 'Fixed', 'Fixed term details...')
    cy.log('Q23')
    expect(contents).to.contain('Additional licence condition for fixed term recall...')
  })
})

When('Maria downloads the Part A and confirms the standard recall', () => {
  cy.downloadDocX('Download the Part A').then(contents => {
    assertQ22_recall_type(contents, 'Standard', 'Standard details...')
  })
})

When('Maria adds licence conditions for the fixed term recall', () => {
  cy.log('========= Fixed term licence conditions')
  cy.selectRadio('Fixed term recall', 'Yes')
  cy.fillInput('Give details', "Additional licence condition for fixed term recall...")
  cy.clickButton('Continue')
})

defineStep("Maria confirms {string} for emergency recall", (answer: string) => {
  cy.selectRadio('Is this an emergency recall?', answer)
  cy.clickButton('Continue')
})