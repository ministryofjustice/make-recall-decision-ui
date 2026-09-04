const testInappropriateErrorPage = (crn?: string) => {
  cy.pageHeading().should('equal', 'You cannot access this page')

  if (crn) {
    cy.get('p').should(
      'contain.text',
      'If you work for the Probation Service, you can check the last completed document to find something in a Part A or decision not to recall letter.',
    )

    cy.get('p')
      .find('a')
      .should('have.attr', 'href', `/cases/${crn}/last-completed`)
      .should('have.text', 'last completed document')
  } else {
    cy.get('p').should(
      'contain.text',
      'If you work for the Probation Service, you can search for the CRN and look up the last completed document.',
    )

    cy.get('p').find('a').should('have.attr', 'href', `/search-by-crn`).should('have.text', 'search for the CRN')
  }

  cy.get('p').should(
    'contain.text',
    'If you work for PPCS, you can check PPUD to find information in a recall booking.',
  )
}

export default testInappropriateErrorPage
