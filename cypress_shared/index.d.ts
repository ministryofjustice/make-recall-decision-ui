export {}

declare global {
  namespace Cypress {
    export interface CommandOpts {
      parent?: string
      clearExistingText?: boolean
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

      getListLabels(labelQaAttr: string, opts?: CommandOpts): Chainable<string[]>

      fillInput(label: string, val: string, opts?: CommandOpts): Chainable<Element>

      selectRadio(groupLabel: string, val: string, opts?: CommandOpts): Chainable<Element>

      getRadioOptionByLabel(groupLabel: string, val: string, opts?: CommandOpts): Chainable<JQuery<HTMLElement>>

      selectCheckboxes(groupLabel: string, values: string[], opts?: CommandOpts): Chainable<Element>

      getTextInputValue(label: string, opts?: CommandOpts): Chainable<string>

      enterDateTime(isoDateTime: string, opts?: CommandOpts): Chainable<void>

      clickButton(label: string, opts?: CommandOpts): Chainable<Element>

      clickLink(label: string, opts?: CommandOpts): Chainable<Element>

      getElement(selector: string | Selector, opts?: CommandOpts): Chainable<JQuery<HTMLElement>>

      viewDetails(summaryLabel: string, opts?: CommandOpts): Chainable<string>

      isDetailsOpen(summaryLabel: string, opts?: CommandOpts): Chainable<boolean>

      getLinkHref(selector: string, opts?: CommandOpts): Chainable<Element>

      getRowValuesFromTable(selectors: TableRowSelectors, opts?: CommandOpts): Chainable<string[]>

      getDefinitionListValue(label: string, opts?: CommandOpts): Chainable<string>

      contactTypeFiltersTotalCount(): Chainable<number>

      assertErrorMessage(args: { fieldGroupId?: string; fieldName?: string; errorText: string })

      downloadPdf(linkText: string): Chainable<string>

      downloadDocX(linkText: string): Chainable<string>

      readBase64File(fileName: string): Chainable<string>
    }
  }
}
