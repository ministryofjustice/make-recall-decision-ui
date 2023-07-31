import { EVENTS } from '../utils/constants'
import { RecommendationResponse } from './make-recall-decision-api'

export interface FormError {
  text: string
  href?: string
  values?: Record<string, unknown> | string
  errorId?: string
  invalidParts?: string[]
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

export type FormValidator = (args: FormValidatorArgs) => FormValidatorReturn

export type CaseSectionId =
  | 'overview'
  | 'risk'
  | 'vulnerabilities'
  | 'personal-details'
  | 'licence-conditions'
  | 'licence-conditions-cvl'
  | 'contact-history'
  | 'recommendations'
  | 'recommendations-prototype'
  | 'last-completed'

export interface PageMetaData {
  id: PageId
  reviewedProperty?: string
  propertyToRefresh?: string
  validator?: FormValidator
  inputDisplayValues?: InputDisplayValues
}

export interface UrlInfo {
  path: string
  fromPageId?: string
  fromAnchor?: string
  currentPageId?: string
  basePath?: string
}

export type PageId =
  | 'managerRecordDecision'
  | 'managerViewDecision'
  | 'managerRecordDecisionDelius'
  | 'managerDecisionConfirmation'
  | 'createRecommendationWarning'
  | 'responseToProbation'
  | 'licenceConditions'
  | 'alternativesToRecallTried'
  | 'indeterminateOrExtendedSentenceDetails'
  | 'managerReview'
  | 'isIndeterminateSentence'
  | 'isExtendedSentence'
  | 'indeterminateSentenceType'
  | 'recallType'
  | 'recallTypeIndeterminate'
  | 'sensitiveInformation'
  | 'emergencyRecall'
  | 'custodyStatus'
  | 'vulnerabilities'
  | 'taskList'
  | 'fixedTermLicenceConditions'
  | 'integratedOffenderManagement'
  | 'localPoliceContactDetails'
  | 'victimContactScheme'
  | 'whatLedToRecall'
  | 'victimLiaisonOfficer'
  | 'arrestIssues'
  | 'contraband'
  | 'personalDetails'
  | 'offenceDetails'
  | 'offenceAnalysis'
  | 'mappa'
  | 'rosh'
  | 'addressDetails'
  | 'previousReleases'
  | 'addPreviousRelease'
  | 'previousRecalls'
  | 'addPreviousRecall'
  | 'confirmationPartA'
  | 'taskListNoRecall'
  | 'whyConsideredRecall'
  | 'reasonsForNoRecall'
  | 'nextAppointment'
  | 'previewNoRecallLetter'
  | 'confirmationNoRecallLetter'
  | 'taskListConsiderRecall'

export interface FormValidatorArgs {
  requestBody: Record<string, string | string[]>
  recommendationId?: string
  urlInfo?: UrlInfo
  token?: string
}

export type FormValidatorReturn = Promise<{
  errors?: NamedFormError[]
  valuesToSave?: Record<string, unknown>
  unsavedValues?: Record<string, unknown>
  nextPagePath?: string
  apiEndpointPathSuffix?: string
  confirmationMessage?: ConfirmationMessage
  monitoringEvent?: {
    eventName: EVENTS
    data: Record<string, unknown>
  }
}>

export interface ConfirmationMessage {
  type: string
  text: string
}

export interface InputDisplayValuesArgs {
  errors: Record<string, FormError>
  unsavedValues: Record<string, unknown>
  apiValues: RecommendationResponse
}

export type InputDisplayValues = (args: InputDisplayValuesArgs) => unknown

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
