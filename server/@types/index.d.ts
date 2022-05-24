import { ContactSummaryResponse } from './make-recall-decision-api/models/ContactSummaryResponse'

export interface ObjectMap<T> {
  [key: string]: T
}

export type CaseSectionId =
  | 'overview'
  | 'risk'
  | 'personal-details'
  | 'licence-history'
  | 'licence-history-data'
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
}
