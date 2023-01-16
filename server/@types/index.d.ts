import { ContactSummaryResponse } from './make-recall-decision-api/models/ContactSummaryResponse'
import { RecommendationResponse } from './make-recall-decision-api'
import { EVENTS } from '../utils/constants'

export interface ObjectMap<T> {
  [key: string]: T
}

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

export interface FormError {
  text: string
  href?: string
  values?: ObjectMap<unknown> | string
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

export interface PageMetaData {
  id: PageId
  reviewedProperty?: string
  propertyToRefresh?: string
  validator?: FormValidator
  inputDisplayValues?: InputDisplayValues
}

export type FormValidator = (args: FormValidatorArgs) => FormValidatorReturn

export interface FormValidatorArgs {
  requestBody: ObjectMap<string | string[]>
  recommendationId?: string
  urlInfo?: UrlInfo
  token?: string
}

export type FormValidatorReturn = Promise<{
  errors?: NamedFormError[]
  valuesToSave?: ObjectMap<unknown>
  unsavedValues?: ObjectMap<unknown>
  nextPagePath?: string
  apiEndpointPathSuffix?: string
  monitoringEvent?: {
    eventName: EVENTS
    data: ObjectMap<unknown>
  }
}>

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

export interface UrlInfo {
  path: string
  fromPageId?: string
  fromAnchor?: string
  currentPageId?: string
  basePath?: string
}

export interface FeatureFlagDefault {
  label: string
  default: boolean
}

export type FeatureFlags = {
  [key: string]: boolean
}

export type PageId =
  | 'managerRecordDecision'
  | 'managerViewDecision'
  | 'managerRecordDecisionDelius'
  | 'managerDecisionConfirmation'
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
  | 'addressDetails'
  | 'previousReleases'
  | 'addPreviousRelease'
  | 'confirmationPartA'
  | 'taskListNoRecall'
  | 'whyConsideredRecall'
  | 'reasonsForNoRecall'
  | 'nextAppointment'
  | 'previewNoRecallLetter'
  | 'confirmationNoRecallLetter'

export interface RecommendationDecorated extends RecommendationResponse {
  isInCustody?: boolean
}
