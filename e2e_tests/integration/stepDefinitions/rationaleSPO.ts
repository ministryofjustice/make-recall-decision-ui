import { When, Then, After } from '@badeball/cypress-cucumber-preprocessor'
import { proxy, flush } from '@alfonso-presa/soft-assert'
import { faker } from '@faker-js/faker/locale/en_GB'
import { openApp } from './index'

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

When('SPO visits the countersigning link', function () {
  openApp(
    { flagRecommendationsPage: 1, flagDeleteRecommendation: 1, flagTriggerWork: 1 },
    true,
    this.spoCounterSignatureLink
  )
})
Then('they are presented with the {string} banner', function (bannerTitle: string) {
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

After(() => {
  flush()
})

Then('the banner is visible until SPO records a decision', function () {
  recordSpoDecision.call(this, true)
})
Then('user is unable to access the page after decision is recorded', function () {
  cy.visit(this.spoCounterSignatureLink)
})
When('SPO records a {string} decision', function (decision: string) {
  recordSpoDecision.call(this, false, decision.trim().replace(/\s/g, '_').toUpperCase())
})
