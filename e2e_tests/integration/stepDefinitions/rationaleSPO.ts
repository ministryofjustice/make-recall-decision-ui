import { DataTable, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor'
import { proxy } from '@alfonso-presa/soft-assert'
import { faker } from '@faker-js/faker/locale/en_GB'
import { CustodyType, openApp, YesNoType } from './index'
import { UserType } from '../../support/commands'
import {
  assertAllPartA,
  q16IndexOffenceDetails,
  q1EmergencyRecall,
  q22RecallType,
  q25ProbationDetails,
  q27SPOEndorsement,
  q28ACOAuthorisation,
  q2IndeterminateSentenceType,
  q3ExtendedSentence,
  q5SentenceDetails,
  q6CustodyStatus,
  q7Addresses,
  q8ArrestIssues,
  q9LocalPoliceDetails,
} from './assertionsPartA'

const expectSoftly = proxy(expect)

const recordSpoDecision = function (spoDecision?: string) {
  cy.clickLink(`Review practitioner's concerns`)
  cy.clickButton('Continue')
  cy.clickLink(`Review profile of ${this.offenderName}`)
  cy.clickButton('Continue')
  cy.clickLink(`Explain the decision`)
  this.testData.spoDecision = spoDecision || faker.helpers.arrayElement(['RECALL', 'NO_RECALL'])
  cy.selectRadioByValue('Explain the decision', this.testData.spoDecision)
  this.testData.spoDecisionExplanation = faker.hacker.phrase()
  cy.get('div:not(.govuk-radios__conditional--hidden)>div>textarea').type(this.testData.spoDecisionExplanation)
  cy.clickButton('Continue')
  cy.clickLink('Record the decision')
  cy.clickButton('Send to NDelius')
}

const recordSpoDecisionAfterCountersigning = function () {
  cy.clickLink(`Review practitioner's concerns`)
  cy.clickButton('Continue')
  cy.clickLink(`Review profile of ${this.offenderName}`)
  cy.clickButton('Continue')
  cy.clickLink(`Explain the decision`)
  cy.log(`this.testData--> ${JSON.stringify(this.testData)}`)
  this.testData.spoDecision = 'RECALL'
  this.testData.spoDecisionExplanation = faker.hacker.phrase()
  cy.get('textarea').type(this.testData.spoDecisionExplanation)
  cy.clickButton('Continue')
  cy.log(`this.testData--> ${JSON.stringify(this.testData)}`)
  cy.clickLink('Record the decision')
  cy.clickButton('Send to NDelius')
}

const doManagerCountersign = function (userType: UserType, data?: Record<string, string>) {
  if (userType === UserType.SPO) {
    this.testData.spoCounterSignature = {}
    if (faker.datatype.boolean() || (data?.Telephone && data.Telephone.toString().toUpperCase().includes('VALID'))) {
      this.testData.spoCounterSignature.telephone = faker.phone.number()
      cy.fillInput('Telephone number', this.testData.spoCounterSignature.telephone)
    }
    cy.clickButton('Continue')
    this.testData.spoCounterSignature.reason = faker.hacker.phrase()
    cy.get('#managerCountersignatureExposition').type(this.testData.spoCounterSignature.reason)
    cy.clickButton('Countersign')
  } else {
    this.testData.acoCounterSignature = {}
    if (faker.datatype.boolean() || (data?.Telephone && data.Telephone.toString().toUpperCase().includes('VALID'))) {
      this.testData.acoCounterSignature.telephone = faker.phone.number()
      cy.fillInput('Telephone number', this.testData.acoCounterSignature.telephone)
    }
    cy.clickButton('Continue')
    this.testData.acoCounterSignature.reason = faker.hacker.phrase()
    cy.get('#managerCountersignatureExposition').type(this.testData.acoCounterSignature.reason)
    cy.clickButton('Countersign')
  }
}

When('{userType}( has) visits/visited the countersigning/review link', function (userType: UserType) {
  cy.clearAllCookies()
  cy.wait(1000)
  cy.reload(true)
  cy.pageHeading().should('equal', 'Sign in')
  openApp(
    { flagRecommendationsPage: 1, flagDeleteRecommendation: 1, flagTriggerWork: 1 },
    userType,
    userType === UserType.SPO ? this.spoCounterSignatureLink : this.acoCounterSignatureLink
  )
})

Then('user is unable to access the page after decision is recorded', function () {
  cy.visit(this.spoCounterSignatureLink)
})

When('SPO( has) records/recorded rationale with {managersDecision} decision', function (decision: string) {
  cy.log('Logging rationale')
  cy.clickLink('Line manager countersignature')
  cy.selectRadioByValue('You must record your rationale', YesNoType.YES.toUpperCase())
  cy.clickButton('Continue')
  recordSpoDecision.call(this, decision)
})

When('SPO( has) records/recorded rationale', function () {
  cy.clickLink('Line manager countersignature')
  cy.selectRadioByValue('You must record your rationale', YesNoType.YES.toUpperCase())
  cy.clickButton('Continue')
  recordSpoDecisionAfterCountersigning.call(this)
})

Then('a confirmation of the {word} is shown to SPO/ACO', function (confirmationPage: string) {
  cy.log(`testData after SPO Decision/SPO/ACO Countersigning--> ${JSON.stringify(this.testData)}`)
  cy.get('#main-content')
    .invoke('text')
    .then(innerText => {
      expectSoftly(innerText).to.contain(
        // eslint-disable-next-line no-nested-ternary
        confirmationPage === 'countersigning'
          ? 'Part A countersigned'
          : this.testData.spoDecision === 'RECALL'
          ? 'Decision to recall'
          : 'Decision not to recall'
      )
      expectSoftly(innerText).to.contain(this.offenderName)
      expectSoftly(innerText).to.contain(this.crn)
    })
})

Then('SPO( has) countersigns/countersigned after recording rationale', function () {
  cy.clickLink('Return to overview')
  cy.clickLink('Countersign')
  cy.clickLink('Line manager countersignature')
  doManagerCountersign.call(this, UserType.SPO, true)
})

Then('SPO( has) countersigns/countersigned after recording rationale with:', function (dataTable: DataTable) {
  cy.clickLink('Return to overview')
  cy.clickLink('Countersign')
  cy.clickLink('Line manager countersignature')
  doManagerCountersign.call(this, UserType.SPO, dataTable.rowsHash())
})

Then('SPO( has) countersigns/countersigned without recording rationale', function () {
  cy.log('Not logging rationale')
  cy.clickLink('Line manager countersignature')
  cy.selectRadioByValue('You must record your rationale', YesNoType.NO.toUpperCase())
  cy.clickButton('Continue')
  doManagerCountersign.call(this, UserType.SPO)
})

Then('SPO( has) countersigns/countersigned without recording rationale with:', function (dataTable: DataTable) {
  cy.log('Not logging rationale')
  cy.clickLink('Line manager countersignature')
  cy.selectRadioByValue('You must record your rationale', YesNoType.NO.toUpperCase())
  cy.clickButton('Continue')
  doManagerCountersign.call(this, UserType.SPO, dataTable.rowsHash())
})

When('SPO( has) requests/requested ACO to countersign', function () {
  cy.getText('case-link').as('acoCounterSignatureLink')
})

When('SPO/ACO task-list is updated with the following status:', function (dataTable: DataTable) {
  const data = dataTable.rowsHash()
  cy.clickLink('Return to Part A')
  Object.keys(data).forEach(k => {
    cy.getTaskStatus(k).then(innerText => expectSoftly(innerText, `${k} Status-SPO Login`).to.contain(data[k]))
  })
})

Then('confirmation page contains a link for ACO to countersign', function () {
  cy.getText('case-link').then(text => {
    cy.log(`ACO sign link--> ${text}`)
    cy.url().then(url => {
      expect(text, 'Recommendation Number match').to.contain(url.match(/\/(\d+)\//)[1])
    })
  })
})

Then('Countersign button is visible on the Overview page', function () {
  cy.get('#main-content')
    .find('a.govuk-button')
    .invoke('text')
    .then(text => expectSoftly(text).to.contain('Countersign'))
})

Then('Part A details are correct', function () {
  const contents = this.partAContent.toString()
  q1EmergencyRecall(
    contents,
    this.testData.recallType === 'EMERGENCY' ? YesNoType.YES : YesNoType[this.testData.emergencyRecall]
  )
  q2IndeterminateSentenceType(contents, YesNoType[this.testData.indeterminate])
  q3ExtendedSentence(contents, YesNoType[this.testData.extended])
  // TODO: q4 - Offender details - Needs to retrieved from https://probation-offender-search-dev.hmpps.service.justice.gov.uk/phrase
  q5SentenceDetails(contents, this.testData.offenceDetails)
  q6CustodyStatus(contents, CustodyType[this.testData.inCustody])
  q7Addresses(contents, this.testData.custodyAddress)
  q8ArrestIssues(contents, YesNoType[this.testData.hasArrestIssues], this.testData.arrestIssueDetails)
  q9LocalPoliceDetails(contents, this.testData.localpoliceDetails)
  q16IndexOffenceDetails(contents, this.testData.offenceAnalysis)
  q22RecallType(contents, this.testData)
  q25ProbationDetails(contents)
  q27SPOEndorsement(contents, this.testData.spoCounterSignature)
  q28ACOAuthorisation(contents, this.testData.acoCounterSignature)
  assertAllPartA()
})

When('{userType}( has) countersigns/countersigned', function (userType: UserType) {
  expect(userType, 'Checking only SPO/ACO user is passed!!').to.not.equal(UserType.PO)
  if (userType === UserType.ACO) cy.clickLink('Senior manager countersignature')
  doManagerCountersign.call(this, userType, false)
})

Given('SPO( has) records/recorded a review decision of {managersDecision}', function (decision: string) {
  recordSpoDecision.call(this, decision)
})

Then('SPO is able to record rationale', function () {
  recordSpoDecisionAfterCountersigning.call(this)
})
