export interface ObjectMap<T> {
  [key: string]: T
}

export type CaseSectionId =
  | 'overview'
  | 'risk'
  | 'personal-details'
  | 'licence-history'
  | 'licence-conditions'
  | 'contact-log'

export interface FormError {
  text: string
  href?: string
  values?: ObjectMap<unknown> | string
}

export interface NamedFormError extends FormError {
  name: string
}

export interface KeyedFormErrors extends ObjectMap<FormError> {
  list: NamedFormError[]
}
