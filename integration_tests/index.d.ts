declare namespace Cypress {
  interface CommandOpts {
    parent: string
  }

  interface TableRowSelectors {
    tableCaption: string
    rowQaAttr: string
  }

  interface Selector {
    qaAttr: string
  }

  interface Chainable {
    /**
     * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn(options?: { failOnStatusCode: boolean }): Chainable<AUTWindow>
    pageHeading(): Chainable<string>
    getText(qaAttr: string, opts?: CommandOpts): Chainable<string>
    fillInput(label: string, val: string): Chainable<Element>
    clickButton(label: string, opts?: CommandOpts): Chainable<Element>
    clickLink(label: string, opts?: CommandOpts): Chainable<Element>
    getElement(selector: string | Selector, opts?: CommandOpts): Chainable<JQuery<HTMLElement>>
    getLinkHref(selector: string, opts?: CommandOpts): Chainable<Element>
    getRowValuesFromTable(selectors: TableRowSelectors, opts?: CommandOpts): Chainable<string[]>
  }
}
