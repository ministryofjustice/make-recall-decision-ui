import { DataTable, Then, When } from '@badeball/cypress-cucumber-preprocessor'
import { proxy } from '@alfonso-presa/soft-assert'
import { faker } from '@faker-js/faker/locale/en_GB'
import { CustodyType, IndeterminateRecallType, NonIndeterminateRecallType, openApp, YesNoType } from './index'
import { UserType } from '../../support/commands'
import {
  assertAllPartA,
  q16IndexOffenceDetails,
  q1EmergencyRecall,
  q22RecallType,
  q25ProbationDetails,
  q27SPOEndorsement,
  q2IndeterminateSentenceType,
  q3ExtendedSentence,
  q5SentenceDetails,
  q6CustodyStatus,
  q7Addresses,
  q8ArrestIssues,
  q9LocalPoliceDetails,
  q28ACOAuthorisation,
} from './assertionsPartA'

const expectSoftly = proxy(expect)

const getBannerDetails = (bannerTitle, optionalArgs: Record<string, string> = {}) => {
  const bannerDetails = {
    'Action required': [
      `You’ve been asked to countersign the Part A for ${optionalArgs.offenderName}. Before doing this, you must explain the rationale for the decision. The rationale will go into NDelius.`,
      `You’ll be able to countersign the Part A when you’ve done this.`,
    ],
  }
  return bannerDetails[bannerTitle]
}

const recordSpoDecision = function (assertBanner?: boolean, spoDecision?: string) {
  cy.clickLink(`Review practitioner's concerns`)
  cy.clickButton('Continue')
  if (assertBanner)
    cy.get('#main-content h2')
      .invoke('text')
      .then(txt => {
        expectSoftly(
          txt
            .replace(/\n/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
        ).to.contain(this.bannerTitle)
      })
  cy.clickLink(`Review profile of ${this.offenderName}`)
  cy.clickButton('Continue')
  if (assertBanner)
    cy.get('#main-content h2')
      .invoke('text')
      .then(txt => {
        expectSoftly(
          txt
            .replace(/\n/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
        ).to.contain(this.bannerTitle)
      })
  cy.clickLink(`Explain the decision`)
  this.testData.spoDecision = spoDecision || faker.helpers.arrayElement(['RECALL', 'NO_RECALL'])
  cy.selectRadioByValue('Explain the decision', this.testData.spoDecision)
  this.testData.spoDecisionExplanation = faker.hacker.phrase()
  cy.get('div:not(.govuk-radios__conditional--hidden)>div>textarea').type(this.testData.spoDecisionExplanation)
  cy.clickButton('Continue')
  if (assertBanner)
    cy.get('#main-content h2')
      .invoke('text')
      .then(txt => {
        expectSoftly(
          txt
            .replace(/\n/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
        ).to.contain(this.bannerTitle)
      })
  cy.log(`this.testData--> ${JSON.stringify(this.testData)}`)
  cy.clickLink('Record the decision')
  cy.clickButton('Send to NDelius')
}

const doManagerCountersign = function (userType: UserType, data?: Record<string, string>) {
  if (userType === UserType.SPO) {
    this.testData.spoCounterSignature = {}
    cy.clickLink('Line manager countersignature')
    if (faker.datatype.boolean() || (data?.Telephone && data.Telephone.toString().toUpperCase().includes('VALID'))) {
      this.testData.spoCounterSignature.telephone = faker.phone.number()
      cy.fillInput('Telephone number', this.testData.spoCounterSignature.telephone)
    }
    cy.clickButton('Continue')
    this.testData.spoCounterSignature.reason = faker.hacker.phrase()
    cy.get('#value').type(this.testData.spoCounterSignature.reason)
    cy.clickButton('Countersign')
  } else {
    this.testData.acoCounterSignature = {}
    cy.getTaskStatus('Senior manager countersignature').then(innerText =>
      expectSoftly(innerText, 'Senior manager countersignature Status-ACO Login').to.contain('Requested')
    )
    cy.clickLink('Senior manager countersignature')
    if (faker.datatype.boolean() || (data?.Telephone && data.Telephone.toString().toUpperCase().includes('VALID'))) {
      this.testData.acoCounterSignature.telephone = faker.phone.number()
      cy.fillInput('Telephone number', this.testData.acoCounterSignature.telephone)
    }
    cy.clickButton('Continue')
    this.testData.acoCounterSignature.reason = faker.hacker.phrase()
    cy.get('#value').type(this.testData.acoCounterSignature.reason)
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
Then('SPO is presented with the {string} banner', function (bannerTitle: string) {
  cy.wrap(bannerTitle).as('bannerTitle')
  cy.get('#main-content h2')
    .invoke('text')
    .then(txt => {
      expectSoftly(
        txt
          .replace(/\n/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim()
      ).to.contain(bannerTitle)
    })
  getBannerDetails(bannerTitle, { offenderName: this.offenderName }).forEach(bannerDetail => {
    cy.get('#main-content [data-qa="warning-text"]')
      .invoke('text')
      .then(txt => {
        expectSoftly(
          txt
            .replace(/\n/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
        ).to.contain(bannerDetail)
      })
  })
})

Then('the banner is visible until SPO records a decision', function () {
  recordSpoDecision.call(this, true)
})

Then('user is unable to access the page after decision is recorded', function () {
  cy.visit(this.spoCounterSignatureLink)
})

When('SPO( has) records/recorded a {string} decision', function (decision: string) {
  cy.wrap(decision).as('spoDecision')
  recordSpoDecision.call(this, false, decision.trim().replace(/\s/g, '_').toUpperCase())
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
          : this.spoDecision === 'RECALL'
          ? 'Decision to recall'
          : 'Decision not to recall'
      )
      expectSoftly(innerText).to.contain(this.offenderName)
      expectSoftly(innerText).to.contain(this.crn)
    })
})

Then('{userType}( has) countersigns/countersigned', function (userType: UserType) {
  doManagerCountersign.call(this, userType)
})

Then('{userType}( has) continues/continued to countersign', function (userType: UserType) {
  cy.clickLink('Return to overview')
  cy.clickLink('Countersign')
  doManagerCountersign.call(this, userType)
})

Then('{userType}( has) continues/continued to countersign with:', function (userType: UserType, dataTable: DataTable) {
  cy.clickLink('Return to overview')
  cy.clickLink('Countersign')
  doManagerCountersign.call(this, userType, dataTable.rowsHash())
})

Then('{userType}( has) countersigns/countersigned with:', function (userType: UserType, dataTable: DataTable) {
  doManagerCountersign.call(this, userType, dataTable.rowsHash())
})

When('SPO requests ACO to countersign', function () {
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
  q1EmergencyRecall(contents, YesNoType[this.testData.emergencyRecall])
  q2IndeterminateSentenceType(contents, YesNoType[this.testData.indeterminate])
  q3ExtendedSentence(contents, YesNoType[this.testData.extended])
  // TODO: q4 - Offender details - Needs to retrieved from https://probation-offender-search-dev.hmpps.service.justice.gov.uk/phrase
  q5SentenceDetails(contents, this.testData.offenceDetails)
  q6CustodyStatus(contents, CustodyType[this.testData.inCustody])
  q7Addresses(contents, this.testData.custodyAddress)
  q8ArrestIssues(contents, YesNoType[this.testData.hasArrestIssues], this.testData.arrestIssueDetails)
  q9LocalPoliceDetails(contents, this.testData.localpoliceDetails)
  q16IndexOffenceDetails(contents, this.testData.offenceAnalysis)
  q22RecallType(
    contents,
    this.testData.indeterminate === 'NO' && this.testData.extended === 'NO'
      ? NonIndeterminateRecallType[this.testData.recallType]
      : IndeterminateRecallType[this.testData.recallType],
    this.testData.partARecallReason
  )
  q25ProbationDetails(contents)
  q27SPOEndorsement(contents, this.testData.spoCounterSignature)
  q28ACOAuthorisation(contents, this.testData.acoCounterSignature)
  assertAllPartA()
})
