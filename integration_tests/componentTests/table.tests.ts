export interface Table {
  caption: string
  header: TableRow
  rows: TableRow[]
  matchLength?: boolean
}

interface TableRow {
  cells: string[]
}

export const testTable = (element: Cypress.Chainable<JQuery<HTMLElement>>, params: Table) => {
  element.within(() => {
    cy.get('caption').should('contain.text', params.caption)

    // Check that the number of header columns match the number provided
    cy.get('thead').within(() => {
      cy.get('tr').then(headerRow => {
        expect(headerRow.find('th').length).to.equal(params.header.cells.length)
        params.header.cells.forEach((headerItem, index) => {
          cy.get('th').eq(index).should('contain.text', headerItem)
        })
      })
    })

    // Check that the number of body rows match the number provided
    cy.get('tbody').within(() => {
      cy.get('tr').then(bodyRows => {
        if (params.matchLength ?? true) {
          expect(bodyRows.length).to.equal(params.rows.length)
        }
        bodyRows.each((rowIndex, row) => {
          const rowData = params.rows[rowIndex]
          expect(row.cells.length).to.equal(rowData.cells.length)
          cy.wrap(row).within(() => {
            rowData.cells.forEach((cellData, cellIndex) => {
              cy.get('td').eq(cellIndex).should('contain.text', cellData)
            })
          })
        })
      })
    })
  })
}
