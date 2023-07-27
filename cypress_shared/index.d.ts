import { UserType } from '../e2e_tests/support/commands'

export {}

declare global {
  namespace Cypress {
    export interface CommandOpts {
      parent?: string
      clearExistingText?: boolean
    }

    export interface TableRowSelectors {
      tableCaption: string
      rowSelector?: string
      firstColValue?: string
    }

    export interface Selector {
      qaAttr: string
    }

    export interface Chainable {
      visitPage(url: string, isSpoUser?: boolean): Chainable<void>

      visitPageAndLogin(url: string, userType?: UserType): Chainable<void>

      pageHeading(): Chainable<string>

      getText(qaAttr: string, opts?: CommandOpts): Chainable<string>

      getTaskStatus(taskName: string, opts?: CommandOpts): Chainable<string>

      getTextFromClipboard(): Chainable<string>

      getListLabels(labelQaAttr: string, opts?: CommandOpts): Chainable<string[]>

      fillInput(label: string, val: string, opts?: CommandOpts): Chainable<Element>

      fillInputByName(name: string, val: string, opts?: CommandOpts): Chainable<Element>

      selectRadio(groupLabel: string, val: string, opts?: CommandOpts): Chainable<Element>

      selectRadioByValue(groupLabel: string, val: string, opts?: CommandOpts): Chainable<Element>

      getSelectableOptionByLabel(groupLabel: string, val: string, opts?: CommandOpts): Chainable<JQuery<HTMLElement>>

      selectCheckboxes(groupLabel: string, values: string[], opts?: CommandOpts): Chainable<Element>

      selectCheckboxesByValue(groupLabel: string, values: string[], opts?: CommandOpts): Chainable<Element>

      getTextInputValue(label: string, opts?: CommandOpts): Chainable<string>

      enterDateTime(
        parts: { day: string; month: string; year: string; hour?: string; minute?: string },
        opts?: CommandOpts
      ): Chainable<void>

      clickButton(label: string, opts?: CommandOpts): Chainable<Element>

      clickLink(label: string, opts?: CommandOpts): Chainable<Element>

      getElement(selector: string | Selector, opts?: CommandOpts): Chainable<JQuery<HTMLElement>>

      viewDetails(summaryLabel: string, opts?: CommandOpts): Chainable<string>

      isDetailsOpen(summaryLabel: string, opts?: CommandOpts): Chainable<boolean>

      getLinkHref(selector: string | Selector, opts?: CommandOpts): Chainable<Element>

      getRowValuesFromTable(selectors: TableRowSelectors, opts?: CommandOpts): Chainable<string[]>

      getDataFromTable(
        tableCaption: string,
        readHrefInsteadOfTextWhereAvailable?: boolean,
        opts?: CommandOpts
      ): Chainable<Record<string, string>[]>

      getDefinitionListValue(label: string, opts?: CommandOpts): Chainable<string>

      contactTypeFiltersTotalCount(): Chainable<number>

      interceptGoogleAnalyticsEvent(query: Record<string, string>, id: string): Chainable<void>

      getDateAttribute(propertyName: string): Chainable<string>

      assertErrorMessage(args: { fieldGroupId?: string; fieldName?: string; errorText: string; fieldError?: string })

      downloadFile(linkText: string): Chainable<Response<unknown>>

      downloadPdf(linkText: string): Chainable<string>

      downloadDocX(linkText: string): Chainable<string>

      readBase64File(fileName: string): Chainable<string>

      logPageTitle(pageTitle: string): Chainable<void>

      getOffenceDetails(): Chainable<Record<string, string>>

      getOffenderDetails(): Chainable<Record<string, string>>

      getPreviousReleases(): Chainable<Record<string, string>>

      getPreviousRecalls(): Chainable<string[]>
    }
  }
}
