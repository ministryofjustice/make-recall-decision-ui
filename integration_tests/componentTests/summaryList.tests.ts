export const testSummaryList = (
  element: Cypress.Chainable<JQuery<HTMLElement>>,
  params: {
    rows: {
      expectedContent: { key: string; value: string }[]
      matchLength?: boolean
    }
  }
) => {
  const summaryRows = element.find('div.govuk-summary-list__row')
  if (params.rows.matchLength ?? true) {
    summaryRows.should('have.length', params.rows.expectedContent.length)
  }
  summaryRows.each((row, index) => {
    const expectedContent = params.rows.expectedContent.at(index)
    if (expectedContent) {
      cy.wrap(row).should('contain.html', 'dt').find('dt').should('contain.text', expectedContent.key)
      cy.wrap(row).should('contain.html', 'dd').find('dd').should('contain.text', expectedContent.value)
    }
  })
}
