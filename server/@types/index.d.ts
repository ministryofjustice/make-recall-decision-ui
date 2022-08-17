import { ContactSummaryResponse } from './make-recall-decision-api/models/ContactSummaryResponse'
import { RecommendationResponse } from './make-recall-decision-api'

export interface ObjectMap<T> {
  [key: string]: T
}

export type CaseSectionId =
  | 'overview'
  | 'risk'
  | 'personal-details'
  | 'licence-conditions'
  | 'contact-history'
  | 'recommendations'

export interface FormError {
  text: string
  href?: string
  values?: ObjectMap<unknown> | string
  errorId?: string
}

export interface NamedFormError extends FormError {
  name: string
}

interface KeyedErrors {
  [key: string]: FormError
}

interface ListErrors {
  list: NamedFormError[]
}

export type KeyedFormErrors = KeyedErrors & ListErrors

export interface PageMetaData {
  templateName: PageTemplateName
  validator?: FormValidator
  inputDisplayValues?: InputDisplayValues
  pageHeading: string
  pageTitle: string
}

export type FormValidator = (args: FormValidatorArgs) => FormValidatorReturn

export interface FormValidatorArgs {
  requestBody: ObjectMap<string | string[]>
  recommendationId: string
}

export interface FormValidatorReturn {
  errors?: NamedFormError[]
  valuesToSave?: ObjectMap<unknown>
  unsavedValues?: ObjectMap<unknown>
  nextPagePath?: string
}

export interface InputDisplayValuesArgs {
  errors: ObjectMap<FormError>
  unsavedValues: ObjectMap<unknown>
  apiValues: RecommendationResponse
}

export type InputDisplayValues = (args: InputDisplayValuesArgs) => unknown

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

export interface ValueWithDetails {
  value?: string | boolean
  details?: string
}

export interface FormOption extends UiListItem {
  detailsLabel?: string
  behaviour?: string
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

export type PageTemplateName =
  | 'responseToProbation'
  | 'alternativesToRecallTried'
  | 'stopThink'
  | 'recallType'
  | 'emergencyRecall'
  | 'custodyStatus'
  | 'victimContactScheme'
  | 'victimLiaisonOfficer'
  | 'arrestIssues'
  | 'confirmationPartA'
  | 'startNoRecall'

export type PageId = 'recall-type' | 'custody-status'
