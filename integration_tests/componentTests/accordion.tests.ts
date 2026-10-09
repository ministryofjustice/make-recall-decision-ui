export interface Accordion {
  sections: AccordionSection[]
  matchLength?: boolean
}

interface AccordionSection {
  heading: string
  summary: string
  contentCheck: (element: Cypress.Chainable<JQuery<HTMLElement>>) => void
  isExpanded: boolean
}

export const testAccordion = (element: Cypress.Chainable<JQuery<HTMLElement>>, params: Accordion) => {
  const sections = element.find('div.govuk-accordion__section')
  if (params.matchLength ?? true) {
    sections.should('have.length', params.sections.length)
  }
  sections.each((section, index) => {
    if (index >= params.sections.length) return

    const item = params.sections[index]
    cy.wrap(section).within(() => {
      cy.get('.govuk-accordion__section-heading').should('contain.text', item.heading)
      cy.get('.govuk-accordion__section-summary').should('contain.text', item.summary)
      cy.get('.govuk-accordion__section-content').then(content => {
        if (item.isExpanded) {
          cy.wrap(content).should('be.visible')
          item.contentCheck(cy.wrap(content))
        } else {
          cy.wrap(content).should('not.be.visible')
        }
      })
    })
  })
}
