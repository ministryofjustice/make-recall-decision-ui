import { ContactSummaryResponse } from './make-recall-decision-api/models/ContactSummaryResponse'
import { strings } from '../textStrings/en'

export interface ObjectMap<T> {
  [key: string]: T
}

export type CaseSectionId =
  | 'overview'
  | 'risk'
  | 'personal-details'
  | 'licence-conditions'
  | 'contact-history'
  | 'contact-history-data'
  | 'all-licence-history'

export interface FormError {
  text: string
  href?: string
  values?: ObjectMap<unknown> | string
}

export interface NamedFormError extends FormError {
  name: string
}

export interface KeyedFormErrors extends ObjectMap<NamedFormError[]> {
  list: NamedFormError[]
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
