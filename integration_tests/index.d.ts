declare namespace Cypress {
  export interface Chainable {
    /**
     * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn(opts?: { hasSpoRole?: boolean }): Chainable<AUTWindow>
    mockCaseSummaryData(): Chainable<AUTWindow>
    mockRecommendationData(): Chainable<AUTWindow>
    createNoRecallLetter(): Chainable<AUTWindow>
  }
}
