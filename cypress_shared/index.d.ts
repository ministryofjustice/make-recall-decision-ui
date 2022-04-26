export {}

declare global {
  namespace Cypress {
    export interface CommandOpts {
      parent: string
    }

    export interface TableRowSelectors {
      tableCaption: string
      rowQaAttr?: string
      firstColValue?: string
    }

    export interface Selector {
      qaAttr: string
    }

    export interface Chainable {
      visitPage(url: string): Chainable<void>

      pageHeading(): Chainable<string>

      getText(qaAttr: string, opts?: CommandOpts): Chainable<string>

      fillInput(label: string, val: string): Chainable<Element>

      clickButton(label: string, opts?: CommandOpts): Chainable<Element>

      clickLink(label: string, opts?: CommandOpts): Chainable<Element>

      getElement(selector: string | Selector, opts?: CommandOpts): Chainable<JQuery<HTMLElement>>

      getLinkHref(selector: string, opts?: CommandOpts): Chainable<Element>

      getRowValuesFromTable(selectors: TableRowSelectors, opts?: CommandOpts): Chainable<string[]>

      getDefinitionListValue(label: string, opts?: CommandOpts): Chainable<string>
    }
  }
}
