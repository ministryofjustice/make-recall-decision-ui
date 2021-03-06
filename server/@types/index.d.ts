import { ContactSummaryResponse } from './make-recall-decision-api/models/ContactSummaryResponse'

export interface ObjectMap<T> {
  [key: string]: T
}

export type CaseSectionId =
  | 'overview'
  | 'risk'
  | 'personal-details'
  | 'licence-conditions'
  | 'contact-history'
  | 'prototype-recommendations'

export interface FormError {
  text: string
  href?: string
  values?: ObjectMap<unknown> | string
  errorId?: string
}

export interface NamedFormError extends FormError {
  name: string
}

export interface KeyedFormErrors extends ObjectMap<NamedFormError[]> {
  list: NamedFormError[]
}

export interface PageMetaData {
  templateName: PageTemplateName
  validator: FormValidator
  pageHeading: string
}

export type FormValidator = (args: FormValidatorArgs) => FormValidatorReturn

export interface FormValidatorArgs {
  requestBody: ObjectMap<string>
}

export interface FormValidatorReturn {
  errors?: NamedFormError[]
  valuesToSave?: ObjectMap<unknown>
  unsavedValues?: ObjectMap<unknown>
  nextPagePath: string
}

export interface DecoratedContact extends ContactSummaryResponse {
  startDate: string
  searchTextMatch?: {
    notes: boolean
    description: boolean
    outcome: boolean
    enforcementAction: boolean
  }
}

export interface SelectableItem {
  id?: number
}

export interface UiListItem {
  value: string
  text: string
  active?: boolean
  selected?: boolean
}

export interface SelectedFilterItem {
  text: string
  href: string
}

export interface UrlInfo {
  path: string
}

export interface FeatureFlag {
  label: string
  default: boolean
}

export interface ContactTypeDecorated {
  code: string
  count: number
  description: string
}

export interface ContactTypeGroupDecorated {
  label: string
  isGroupOpen: boolean
  contactTypeCodes: {
    value: string
    description: string
    html: string
    count: number
  }[]
}

export interface ContactHistoryFilters {
  'dateFrom-day': string
  'dateFrom-month': string
  'dateFrom-year': string
  'dateTo-day': string
  'dateTo-month': string
  'dateTo-year': string
  contactTypes: string | string[]
  searchFilters: string | string[]
}

export type PageTemplateName = 'recallType'

export type PageId = 'recall-type'
