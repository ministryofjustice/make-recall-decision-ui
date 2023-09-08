import { After, Before, defineParameterType, Then, When } from '@badeball/cypress-cucumber-preprocessor'
import { flush } from '@alfonso-presa/soft-assert'
import { UserType } from '../support/commands'
import {
  q10Vulnerabilities,
  q11Contraband,
  q12MappaDetails,
  q13RegisteredPPOIOM,
  q14VLOContact,
  q15RoshLevels,
  q16IndexOffenceDetails,
  q17LicenceConditions,
  q18AdditionalConditions,
  q19CircumstancesLeadingToRecall,
  q1EmergencyRecall,
  q20ResponseToSupervision,
  q21Alternatives,
  q22RecallType,
  q23LicenceConditionsToAdd,
  q24ISPESP,
  q25ProbationDetails,
  q26OffenderManager,
  q27SPOEndorsement,
  q28ACOAuthorisation,
  q29Attachments,
  q2IndeterminateSentenceType,
  q3ExtendedSentence,
  q4OffenderDetails,
  q5SentenceDetails,
  q6CustodyStatus,
  q7Addresses,
  q8ArrestIssues,
  q9LocalPoliceDetails,
} from './assertionsPartA'
import { CustodyType, YesNoType } from '../support/enums'

export const crns = {
  1: Cypress.env('CRN') || 'X098092',
  2: Cypress.env('CRN2') || 'X514364',
  3: Cypress.env('CRN3') || 'X252642',
  4: Cypress.env('CRN4') || 'X487027',
  5: Cypress.env('CRN5') || 'X476202',
}
export const deleteOpenRecommendation = () => {
  cy.clickLink('Recommendations')
  // check if Delete button is available (the flag is enabled)
  cy.get('body').then($body => {
    const { length } = $body.find('[data-qa="delete-recommendation"]')
    if (length) {
      // If the first Recommendation is Open then delete it so that a new recommendation can be created
      // Cypress stops the tests if the screen redirects to same page more than 20 times, so limiting the deletes to first 10, if more exists
      for (let i = 0; i < (length > 10 ? 10 : length); i += 1) {
        cy.getRowValuesFromTable({ tableCaption: 'Recommendations', rowSelector: 'tr[data-qa]:first-child' }).then(
          // eslint-disable-next-line no-loop-func
          () => {
            cy.get('[data-qa] [data-qa="delete-recommendation"]').first().click()
          }
        )
      }
    }
  })
}

export const openApp = function (queryParams: object, userType?: UserType, newUrl?: string) {
  let queryParameters = ''
  Object.keys(queryParams).forEach(keyName => {
    queryParameters = `${queryParameters + keyName}=${queryParams[keyName]}&`
  })
  cy.visitPageAndLogin(`${newUrl || ''}?${queryParameters}`, userType || UserType.PO)
}

export const signOut = function () {
  cy.get('body').then($body => {
    const signOutSelector = '[data-qa="signOut"]'
    if ($body.find(signOutSelector).length > 0) cy.get(signOutSelector).click()
  })
  cy.clearAllCookies()
}

function loginAndSearchCrn(userType: UserType) {
  signOut()
  cy.wait(1000)
  cy.reload(true)
  cy.pageHeading().should('equal', 'Sign in')
  openApp(
    {
      flagRecommendationsPage: 1,
      flagDeleteRecommendation: 1,
      flagTriggerWork: 1,
      flagLastCompleted: 1,
    },
    userType
  )
  cy.clickLink('Start now')
  cy.clickLink('Search by case reference number (CRN)')
  cy.fillInputByName('crn', this.crn)
  cy.clickButton('Search')
  cy.clickLink(this.offenderName)
}

/* ---- Cucumber glue ---- */

defineParameterType({ name: 'userType', regexp: /PO|SPO|ACO/, transformer: s => UserType[s] })

defineParameterType({
  name: 'managersDecision',
  regexp: /RECALL|NO_RECALL/,
  transformer: s => s,
})

Before(() => {
  openApp({ flagRecommendationsPage: 1, flagDeleteRecommendation: 1 })
})

After(function () {
  cy.log(`this.testData@End--> ${JSON.stringify(this.testData)}`)
  flush()
})

When('{userType} logs( back) in to update/view Recommendation', function (userType: UserType) {
  loginAndSearchCrn.call(this, userType)
  cy.clickLink('Update recommendation')
})

When('{userType} logs( back) in to view All Recommendations', function (userType: UserType) {
  loginAndSearchCrn.call(this, userType)
  cy.clickLink('Recommendations')
})

When('PO creates a new Recommendation for same CRN', function () {
  cy.clickLink(`Back to overview for ${this.offenderName}`)
  cy.clickLink('Consider a recall', { parent: '#main-content' })
  cy.clickButton('Continue')
})

When('{userType}( has) logged/logs( back) in to/and download(ed) Part A', function (userType: UserType) {
  loginAndSearchCrn.call(this, userType)
  cy.clickLink('Update recommendation')
  cy.clickLink('Create Part A')
  cy.downloadDocX('Download the Part A').as('partAContent')
})

When('{userType}( has) logged/logs (back )in to Countersign', function (userType: UserType) {
  expect(userType, 'Checking only SPO/ACO user is passed!!').to.not.equal(UserType.PO)
  loginAndSearchCrn.call(this, userType)
  cy.clickLink('Countersign')
  if (userType === UserType.SPO) cy.clickLink('Line manager countersignature')
})

When('{userType} logs( back) in to add rationale', function (userType: UserType) {
  loginAndSearchCrn.call(this, userType)
  cy.clickLink('Consider a recall', { parent: '#main-content' })
})

Then('the page heading contains {string}', heading => {
  cy.pageHeading().should('contains', heading)
})

Then('PO/SPO/ACO can create Part A', function () {
  cy.clickLink('Create Part A')
})

Then('PO/SPO/ACO can download Part A', function () {
  cy.downloadDocX('Download the Part A').as('partAContent')
})

Then('Part A details are correct', function () {
  cy.log(`this.testData--> ${JSON.stringify(this.testData)}`)
  const contents = this.partAContent.toString()
  q1EmergencyRecall(contents, YesNoType[this.testData.emergencyRecall])
  q2IndeterminateSentenceType(contents, YesNoType[this.testData.indeterminate])
  q3ExtendedSentence(contents, YesNoType[this.testData.extended])
  q4OffenderDetails(contents, this.testData.offenderDetails)
  q5SentenceDetails(contents, this.testData.offenceDetails)
  q6CustodyStatus(contents, CustodyType[this.testData.inCustody])
  q7Addresses(contents, this.testData.custodyAddress)
  q8ArrestIssues(contents, YesNoType[this.testData.hasArrestIssues], this.testData.arrestIssueDetails)
  q9LocalPoliceDetails(contents, this.testData.localPoliceDetails)
  q10Vulnerabilities(contents, this.testData.vulnerabilities)
  q11Contraband(contents, this.testData.contraband)
  q12MappaDetails(contents, this.testData.mappa)
  q13RegisteredPPOIOM(contents, this.testData.iom)
  q14VLOContact(contents, this.testData.vlo)
  q15RoshLevels(contents, this.testData.currentRoshForPartA)
  q16IndexOffenceDetails(contents, this.testData.offenceAnalysis)
  q17LicenceConditions(contents, this.testData.licenceConditions.standard)
  q18AdditionalConditions(contents, this.testData.licenceConditions.advanced)
  q19CircumstancesLeadingToRecall(contents, this.testData.reasonForRecall)
  q20ResponseToSupervision(contents, this.testData.probationResponse)
  q21Alternatives(contents, this.testData.alternativesTried)
  q22RecallType(contents, this.testData)
  q23LicenceConditionsToAdd(contents, {
    fixedTermRecallNotes: this.testData.fixedTermRecallNotes,
    recallType: this.testData.recallType,
    fixedTermRecall: this.testData.fixedTermRecall,
    indeterminate: this.testData.indeterminate,
    extended: this.testData.extended,
  })
  q24ISPESP(contents, this.testData.indeterminateOrExtendedSentenceDetails)
  if (Cypress.env('ENV')?.toString().toUpperCase() !== 'PREPROD') q25ProbationDetails(contents)
  q26OffenderManager(contents, this.testData.localPoliceDetails)
  q27SPOEndorsement.call(this, contents, this.testData.spoCounterSignature)
  q28ACOAuthorisation.call(this, contents, this.testData.acoCounterSignature)
  q29Attachments(contents, this.testData.localPoliceDetails)
})

When('PO returns to Recommendations page of CRN', function () {
  cy.clickLink(`Back`)
  cy.clickLink('Back')
  cy.clickLink('Recommendations')
})

Then('SPO can no longer record rationale', function () {
  loginAndSearchCrn.call(this, UserType.SPO)
  cy.get('#main-content a:contains("Consider a recall")').should('not.exist')
})

Then('SPO can see the case is closed on the Overview page', function () {
  cy.clickLink('Return to overview')
  cy.get('#main-content a:contains("Consider a recall")').should('not.exist')
})

Then('PO can see the case is closed on the Overview page', function () {
  cy.clickLink(`Back to overview for ${this.offenderName}`)
  cy.get('#main-content a:contains("Consider a recall")').should('not.exist')
})
