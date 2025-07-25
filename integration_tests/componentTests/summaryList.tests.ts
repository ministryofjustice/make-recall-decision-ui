export interface SummaryList {
  rows: SummaryListRow[]
  matchLength?: boolean
}

interface SummaryListRow {
  key: string
  value: string
  editLink?: SummaryListEditLink
}

interface SummaryListEditLink {
  label?: string
  url: string
  accessibleLabel: string
}

export const testSummaryList = (element: Cypress.Chainable<JQuery<HTMLElement>>, params: SummaryList) => {
  const summaryRows = element.find('div.govuk-summary-list__row')
  // Check that the number of rows in the dl match the number provided
  if (params.matchLength ?? true) {
    summaryRows.should('have.length', params.rows.length)
  }
  summaryRows.each((row, index) => {
    const item = params.rows[index]
    const label = item.editLink?.label ?? 'Edit'
    cy.wrap(row).within(() => {
      cy.get('dt').should('contain.text', item.key).next().get('dd').should('contain.text', item.value)
      if (item.editLink) {
        cy.wrap(row)
          .should('contain', label)
          .within(() => {
            cy.get('a').should('have.class', 'govuk-link').should('have.attr', 'href').and('include', item.editLink.url)
            cy.get('a').within(() => {
              cy.get('span')
                .should('have.class', 'govuk-visually-hidden')
                .and('contain.text', item.editLink.accessibleLabel)
            })
          })
      } else {
        cy.get('dd').should('have.length', '1')
      }
    })
  })
}
