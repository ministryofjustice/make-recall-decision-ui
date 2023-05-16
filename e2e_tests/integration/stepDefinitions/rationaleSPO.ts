import { When, Then } from '@badeball/cypress-cucumber-preprocessor'

const getBannerDetails = (bannerTitle, optionalArgs: Record<string, string> = {}) => {
  const bannerDetails = {
    'Action Required': `You’ve been asked to countersign the Part A for ${optionalArgs.offenderName}. Before doing this, you must explain the rationale for the decision. The rationale will go into NDelius.

You’ll be able to countersign the Part A when you’ve done this.`,
  }
  return bannerDetails[bannerTitle]
}

When('SPO visits the countersigning link', function () {
  cy.visitPage(this.spoCounterSignatureLink, true)
})
Then('they are presented with the {string} banner', function (bannerTitle: string) {
  cy.get('#main-content h2').should('equal', bannerTitle)
  cy.get('#main-content [data-qa="warning-text"]').contains(
    getBannerDetails(bannerTitle, { offenderName: this.offenderName })
  )
})
