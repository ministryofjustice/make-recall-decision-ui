import { PageMetaData } from '../../../@types'
import { AppError } from '../../../AppError'
import { strings } from '../../../textStrings/en'
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

export const pageMetaData = (pageId?: unknown): PageMetaData => {
  switch (pageId) {
    case 'response-to-probation':
      return {
        templateName: 'responseToProbation',
        validator: validateResponseToProbation,
        inputDisplayValues: inputDisplayValuesResponseToProbation,
        pageHeading: strings.pageHeadings.responseToProbation,
        pageTitle: strings.pageTitles.responseToProbation,
      }
    case 'licence-conditions':
      return {
        templateName: 'licenceConditions',
        validator: validateLicenceConditionsBreached,
        inputDisplayValues: inputDisplayValuesLicenceConditions,
        pageHeading: strings.pageHeadings.licenceConditions,
        pageTitle: strings.pageTitles.licenceConditions,
      }
    case 'alternatives-tried':
      return {
        templateName: 'alternativesToRecallTried',
        validator: validateAlternativesTried,
        inputDisplayValues: inputDisplayValuesAlternativesToRecallTried,
        pageHeading: strings.pageHeadings.alternativesToRecallTried,
        pageTitle: strings.pageTitles.alternativesToRecallTried,
      }
    case 'stop-think':
      return {
        templateName: 'stopThink',
        pageHeading: strings.pageHeadings.stopThink,
        pageTitle: strings.pageHeadings.stopThink,
      }
    case 'recall-type':
      return {
        templateName: 'recallType',
        validator: validateRecallType,
        inputDisplayValues: inputDisplayValuesRecallType,
        pageHeading: strings.pageHeadings.recallType,
        pageTitle: strings.pageHeadings.recallType,
      }
    case 'emergency-recall':
      return {
        templateName: 'emergencyRecall',
        validator: validateEmergencyRecall,
        inputDisplayValues: inputDisplayValuesEmergencyRecall,
        pageHeading: strings.pageHeadings.emergencyRecall,
        pageTitle: strings.pageHeadings.emergencyRecall,
      }
    case 'custody-status':
      return {
        templateName: 'custodyStatus',
        validator: validateCustodyStatus,
        inputDisplayValues: inputDisplayValuesCustodyStatus,
        pageHeading: strings.pageHeadings.custodyStatus,
        pageTitle: strings.pageTitles.custodyStatus,
      }
    case 'vulnerabilities':
      return {
        templateName: 'vulnerabilities',
        validator: validateVulnerabilities,
        inputDisplayValues: inputDisplayValuesVulnerabilities,
        pageHeading: strings.pageHeadings.vulnerabilities,
        pageTitle: strings.pageTitles.vulnerabilities,
      }
    case 'what-led':
      return {
        templateName: 'whatLedToRecall',
        validator: validateWhatLedToRecall,
        inputDisplayValues: inputDisplayValuesWhatLedToRecall,
        pageHeading: strings.pageHeadings.whatLedToRecall,
        pageTitle: strings.pageTitles.whatLedToRecall,
      }
    case 'task-list':
      return {
        templateName: 'taskList',
        pageHeading: strings.pageHeadings.taskList,
        pageTitle: strings.pageTitles.taskList,
      }
    case 'iom':
      return {
        templateName: 'integratedOffenderManagement',
        validator: validateIntegratedOffenderManagement,
        inputDisplayValues: inputDisplayValuesIntegratedOffenderManagement,
        pageHeading: strings.pageHeadings.integratedOffenderManagement,
        pageTitle: strings.pageTitles.integratedOffenderManagement,
      }
    case 'police-details':
      return {
        templateName: 'localPoliceContactDetails',
        validator: validateLocalPoliceContactDetails,
        inputDisplayValues: inputDisplayValuesLocalPoliceContactDetails,
        pageHeading: strings.pageHeadings.localPoliceContactDetails,
        pageTitle: strings.pageTitles.localPoliceContactDetails,
      }
    case 'victim-contact-scheme':
      return {
        templateName: 'victimContactScheme',
        validator: validateVictimContactScheme,
        inputDisplayValues: inputDisplayValuesVictimContactScheme,
        pageHeading: strings.pageHeadings.victimContactScheme,
        pageTitle: strings.pageTitles.victimContactScheme,
      }
    case 'victim-liaison-officer':
      return {
        templateName: 'victimLiaisonOfficer',
        validator: validateVictimLiaisonOfficer,
        inputDisplayValues: inputDisplayValuesVictimLiaisonOfficer,
        pageHeading: strings.pageHeadings.victimLiaisonOfficer,
        pageTitle: strings.pageTitles.victimLiaisonOfficer,
      }
    case 'arrest-issues':
      return {
        templateName: 'arrestIssues',
        validator: validateArrestIssues,
        inputDisplayValues: inputDisplayValuesArrestIssues,
        pageHeading: strings.pageHeadings.arrestIssues,
        pageTitle: strings.pageHeadings.arrestIssues,
      }
    case 'confirmation-part-a':
      return {
        templateName: 'confirmationPartA',
        pageHeading: strings.pageHeadings.confirmationPartA,
        pageTitle: strings.pageTitles.confirmationPartA,
      }
    case 'start-no-recall':
      return {
        templateName: 'startNoRecall',
        pageHeading: strings.pageHeadings.startNoRecall,
        pageTitle: strings.pageTitles.startNoRecall,
      }
    default:
      throw new AppError(`getPageMetaData - invalid pageId: ${pageId}`, { status: 404 })
  }
}
