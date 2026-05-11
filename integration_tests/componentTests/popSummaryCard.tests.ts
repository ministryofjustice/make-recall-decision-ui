import { testSummaryList } from './summaryList.tests'

export interface PopSummaryCard {
  title: string
  convictionDetails: ConvictionDetails[]
}

export interface ConvictionDetails {
  mainOffenceDescription: string
  additionalOffences: AdditionalOffenceDetails[]
  sentenceDetails: SentenceDetails
}

export interface AdditionalOffenceDetails {
  description: string
}

export interface SentenceDetails {
  description: string
  length: number
  lengthUnits: string
}

// Note element should be the summary card element (there is no pop summary card component, it
// is just a summary card with an established structure for the body)
const testPopSummaryCard = (summaryCard: Cypress.Chainable<JQuery<HTMLElement>>, params: PopSummaryCard) => {
  summaryCard.then($summaryCard => {
    cy.wrap($summaryCard)
      .find('.app-summary-card__header')
      .find('.app-summary-card__title')
      .should('contain.text', params.title)

    cy.wrap($summaryCard)
      .find('.app-summary-card__body')
      .then($body => {
        params.convictionDetails.forEach((convictionDetails, index) => {
          testSummaryList(cy.wrap($body).find(`#conviction-${index + 1}`), {
            rows: [
              { key: 'Main offence', value: convictionDetails.mainOffenceDescription },
              convictionDetails.additionalOffences.length > 0
                ? {
                    key: 'Additional offence',
                    valueRegex: new RegExp(
                      `\\s*${convictionDetails.additionalOffences.map(offence => offence.description).join('\\s*')}\\s*`,
                    ),
                  }
                : undefined,
              { key: 'Sentence type', value: convictionDetails.sentenceDetails.description },
              {
                key: 'Sentence length',
                value: `${convictionDetails.sentenceDetails.length} ${convictionDetails.sentenceDetails.lengthUnits}`,
              },
            ],
          })
        })
      })
  })
}

export default testPopSummaryCard
