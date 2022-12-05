import { PageMetaData } from '../../../@types'
import { AppError } from '../../../AppError'
import { validateRecallType } from '../recallType/formValidator'
import { validateCustodyStatus } from '../custodyStatus/formValidator'
import { inputDisplayValuesRecallType } from '../recallType/inputDisplayValues'
import { inputDisplayValuesCustodyStatus } from '../custodyStatus/inputDisplayValues'
import { validateResponseToProbation } from '../responseToProbation/formValidator'
import { inputDisplayValuesResponseToProbation } from '../responseToProbation/inputDisplayValues'
import { validateEmergencyRecall } from '../emergencyRecall/formValidator'
import { inputDisplayValuesEmergencyRecall } from '../emergencyRecall/inputDisplayValues'
import { validateVictimContactScheme } from '../victimContactScheme/formValidator'
import { inputDisplayValuesVictimContactScheme } from '../victimContactScheme/inputDisplayValues'
import { validateVictimLiaisonOfficer } from '../victimLiaisonOfficer/formValidator'
import { inputDisplayValuesVictimLiaisonOfficer } from '../victimLiaisonOfficer/inputDisplayValues'
import { validateAlternativesTried } from '../alternativesToRecallTried/formValidator'
import { inputDisplayValuesAlternativesToRecallTried } from '../alternativesToRecallTried/inputDisplayValues'
import { validateArrestIssues } from '../arrestIssues/formValidator'
import { inputDisplayValuesArrestIssues } from '../arrestIssues/inputDisplayValues'
import { validateLicenceConditionsBreached } from '../licenceConditions/formValidator'
import { inputDisplayValuesLicenceConditions } from '../licenceConditions/inputDisplayValues'
import { validateIntegratedOffenderManagement } from '../integratedOffenderManagement/formValidator'
import { inputDisplayValuesIntegratedOffenderManagement } from '../integratedOffenderManagement/inputDisplayValues'
import { validateLocalPoliceContactDetails } from '../localPoliceContactDetails/formValidator'
import { inputDisplayValuesLocalPoliceContactDetails } from '../localPoliceContactDetails/inputDisplayValues'
import { inputDisplayValuesVulnerabilities } from '../vulnerabilities/inputDisplayValues'
import { validateVulnerabilities } from '../vulnerabilities/formValidator'
import { validateWhatLedToRecall } from '../whatLedToRecall/formValidator'
import { inputDisplayValuesWhatLedToRecall } from '../whatLedToRecall/inputDisplayValues'
import { validateContraband } from '../contraband/formValidator'
import { inputDisplayValuesContraband } from '../contraband/inputDisplayValues'
import { validateIsIndeterminateSentence } from '../isIndeterminateSentence/formValidator'
import { inputDisplayValuesIsIndeterminateSentence } from '../isIndeterminateSentence/inputDisplayValues'
import { validateIndeterminateSentenceType } from '../indeterminateSentenceType/formValidator'
import { inputDisplayValuesIndeterminateSentenceType } from '../indeterminateSentenceType/inputDisplayValues'
import { validateIsExtendedSentence } from '../isExtendedSentence/formValidator'
import { inputDisplayValuesIsExtendedSentence } from '../isExtendedSentence/inputDisplayValues'
import { validateRecallTypeIndeterminate } from '../recallTypeIndeterminate/formValidator'
import { inputDisplayValuesRecallTypeIndeterminate } from '../recallTypeIndeterminate/inputDisplayValues'
import { validateFixedTermLicenceConditions } from '../fixedTermAdditionalLicenceConditions/formValidator'
import { inputDisplayValuesFixedTermLicenceConditions } from '../fixedTermAdditionalLicenceConditions/inputDisplayValues'
import { validateIndeterminateDetails } from '../indeterminateOrExtendedSentenceDetails/formValidator'
import { inputDisplayValuesIndeterminateDetails } from '../indeterminateOrExtendedSentenceDetails/inputDisplayValues'
import { validateWhyConsideredRecall } from '../whyConsideredRecall/formValidator'
import { inputDisplayValuesWhyConsideredRecall } from '../whyConsideredRecall/inputDisplayValues'
import { validateReasonsForNoRecall } from '../reasonsForNoRecall/formValidator'
import { inputDisplayValuesReasonsForNoRecall } from '../reasonsForNoRecall/inputDisplayValues'
import { validateNextAppointment } from '../nextAppointment/formValidator'
import { inputDisplayValuesNextAppointment } from '../nextAppointment/inputDisplayValues'
import { validateAddress } from '../addressDetails/formValidator'
import { inputDisplayValuesAddress } from '../addressDetails/inputDisplayValues'
import { validateOffenceAnalysis } from '../offenceAnalysis/formValidator'
import { inputDisplayValuesOffenceAnalysis } from '../offenceAnalysis/inputDisplayValues'
import { validatePreviousReleases } from '../previousReleases/formValidator'
import { inputDisplayValuesPreviousReleases } from '../previousReleases/inputDisplayValues'
import { validateAddPreviousRelease } from '../addPreviousRelease/formValidator'
import { inputDisplayValuesAddPreviousRelease } from '../addPreviousRelease/inputDisplayValues'

export const pageMetaData = (pageUrlSlug?: unknown): PageMetaData => {
  switch (pageUrlSlug) {
    case 'response-to-probation':
      return {
        id: 'responseToProbation',
        validator: validateResponseToProbation,
        inputDisplayValues: inputDisplayValuesResponseToProbation,
      }
    case 'licence-conditions':
      return {
        id: 'licenceConditions',
        validator: validateLicenceConditionsBreached,
        inputDisplayValues: inputDisplayValuesLicenceConditions,
      }
    case 'alternatives-tried':
      return {
        id: 'alternativesToRecallTried',
        validator: validateAlternativesTried,
        inputDisplayValues: inputDisplayValuesAlternativesToRecallTried,
      }
    case 'stop-think':
      return {
        id: 'stopThink',
      }
    case 'is-indeterminate':
      return {
        id: 'isIndeterminateSentence',
        validator: validateIsIndeterminateSentence,
        inputDisplayValues: inputDisplayValuesIsIndeterminateSentence,
      }
    case 'is-extended':
      return {
        id: 'isExtendedSentence',
        validator: validateIsExtendedSentence,
        inputDisplayValues: inputDisplayValuesIsExtendedSentence,
      }
    case 'indeterminate-type':
      return {
        id: 'indeterminateSentenceType',
        validator: validateIndeterminateSentenceType,
        inputDisplayValues: inputDisplayValuesIndeterminateSentenceType,
      }
    case 'recall-type-indeterminate':
      return {
        id: 'recallTypeIndeterminate',
        validator: validateRecallTypeIndeterminate,
        inputDisplayValues: inputDisplayValuesRecallTypeIndeterminate,
      }
    case 'indeterminate-details':
      return {
        id: 'indeterminateOrExtendedSentenceDetails',
        validator: validateIndeterminateDetails,
        inputDisplayValues: inputDisplayValuesIndeterminateDetails,
      }
    case 'recall-type':
      return {
        id: 'recallType',
        validator: validateRecallType,
        inputDisplayValues: inputDisplayValuesRecallType,
      }
    case 'fixed-licence':
      return {
        id: 'fixedTermLicenceConditions',
        validator: validateFixedTermLicenceConditions,
        inputDisplayValues: inputDisplayValuesFixedTermLicenceConditions,
      }
    case 'sensitive-info':
      return {
        id: 'sensitiveInformation',
      }
    case 'emergency-recall':
      return {
        id: 'emergencyRecall',
        validator: validateEmergencyRecall,
        inputDisplayValues: inputDisplayValuesEmergencyRecall,
      }
    case 'custody-status':
      return {
        id: 'custodyStatus',
        validator: validateCustodyStatus,
        inputDisplayValues: inputDisplayValuesCustodyStatus,
      }
    case 'vulnerabilities':
      return {
        id: 'vulnerabilities',
        validator: validateVulnerabilities,
        inputDisplayValues: inputDisplayValuesVulnerabilities,
      }
    case 'what-led':
      return {
        id: 'whatLedToRecall',
        validator: validateWhatLedToRecall,
        inputDisplayValues: inputDisplayValuesWhatLedToRecall,
      }
    case 'task-list':
      return {
        id: 'taskList',
      }
    case 'iom':
      return {
        id: 'integratedOffenderManagement',
        validator: validateIntegratedOffenderManagement,
        inputDisplayValues: inputDisplayValuesIntegratedOffenderManagement,
      }
    case 'police-details':
      return {
        id: 'localPoliceContactDetails',
        validator: validateLocalPoliceContactDetails,
        inputDisplayValues: inputDisplayValuesLocalPoliceContactDetails,
      }
    case 'victim-contact-scheme':
      return {
        id: 'victimContactScheme',
        validator: validateVictimContactScheme,
        inputDisplayValues: inputDisplayValuesVictimContactScheme,
      }
    case 'victim-liaison-officer':
      return {
        id: 'victimLiaisonOfficer',
        validator: validateVictimLiaisonOfficer,
        inputDisplayValues: inputDisplayValuesVictimLiaisonOfficer,
      }
    case 'arrest-issues':
      return {
        id: 'arrestIssues',
        validator: validateArrestIssues,
        inputDisplayValues: inputDisplayValuesArrestIssues,
      }
    case 'personal-details':
      return {
        id: 'personalDetails',
        reviewedProperty: 'personOnProbation',
      }
    case 'offence-details':
      return {
        id: 'offenceDetails',
        reviewedProperty: 'convictionDetail',
      }
    case 'previous-releases':
      return {
        id: 'previousReleases',
        propertyToRefresh: 'previousReleases',
        validator: validatePreviousReleases,
        inputDisplayValues: inputDisplayValuesPreviousReleases,
      }
    case 'add-previous-release':
      return {
        id: 'addPreviousRelease',
        validator: validateAddPreviousRelease,
        inputDisplayValues: inputDisplayValuesAddPreviousRelease,
      }
    case 'offence-analysis':
      return {
        id: 'offenceAnalysis',
        validator: validateOffenceAnalysis,
        inputDisplayValues: inputDisplayValuesOffenceAnalysis,
      }
    case 'mappa':
      return {
        id: 'mappa',
        reviewedProperty: 'mappa',
        propertyToRefresh: 'mappa',
      }
    case 'address-details':
      return {
        id: 'addressDetails',
        validator: validateAddress,
        inputDisplayValues: inputDisplayValuesAddress,
      }
    case 'contraband':
      return {
        id: 'contraband',
        validator: validateContraband,
        inputDisplayValues: inputDisplayValuesContraband,
      }
    case 'confirmation-part-a':
      return {
        id: 'confirmationPartA',
      }
    case 'task-list-no-recall':
      return {
        id: 'taskListNoRecall',
      }
    case 'why-considered-recall':
      return {
        id: 'whyConsideredRecall',
        validator: validateWhyConsideredRecall,
        inputDisplayValues: inputDisplayValuesWhyConsideredRecall,
      }
    case 'reasons-no-recall':
      return {
        id: 'reasonsForNoRecall',
        validator: validateReasonsForNoRecall,
        inputDisplayValues: inputDisplayValuesReasonsForNoRecall,
      }
    case 'appointment-no-recall':
      return {
        id: 'nextAppointment',
        validator: validateNextAppointment,
        inputDisplayValues: inputDisplayValuesNextAppointment,
      }
    case 'preview-no-recall':
      return {
        id: 'previewNoRecallLetter',
      }
    case 'confirmation-no-recall':
      return {
        id: 'confirmationNoRecallLetter',
      }
    default:
      throw new AppError(`getPageMetaData - invalid pageUrlSlug: ${pageUrlSlug}`, { status: 404 })
  }
}
