import { RequestHandler, Router } from 'express'
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { createRecommendationController } from '../controllers/recommendations/createRecommendation'
import { createAndDownloadDocument } from '../controllers/recommendations/createAndDownloadDocument'
import { updateRecommendationStatus } from '../controllers/recommendations/updateRecommendationStatus'
import { RouteBuilder } from './RouteBuilder'
import { STATUSES } from '../middleware/recommendationStatusCheck'
import taskListConsiderRecallController from '../controllers/recommendation/taskListConsiderRecallController'
import responseToProbationController from '../controllers/recommendation/responseToProbationController'
import licenceConditionsController from '../controllers/recommendation/licenceConditionsController'
import alternativesToRecallTriedController from '../controllers/recommendation/alternativesToRecallTriedController'
import triggerLeadingToRecallController from '../controllers/recommendation/triggerLeadingToRecallController'
import isIndeterminateController from '../controllers/recommendation/isIndeterminateController'
import isExtendedController from '../controllers/recommendation/isExtendedController'
import indeterminateTypeController from '../controllers/recommendation/indeterminateTypeController'
import shareCaseWithManagerController from '../controllers/recommendation/shareCaseWithManagerController'
import shareCaseWithAdminController from '../controllers/recommendation/shareCaseWithAdminController'
import discussWithManagerController from '../controllers/recommendation/discussWithManagerController'
import recallTypeController from '../controllers/recommendation/recallTypeController'
import recallTypeIndeterminateController from '../controllers/recommendation/recallTypeIndeterminateController'
import redirectController from '../controllers/recommendation/redirectController'
import spoTaskListConsiderRecallController from '../controllers/recommendation/spoTaskListConsiderRecallController'
import reviewPractitionersConcernsController from '../controllers/recommendation/reviewPractitionersConcernsController'
import caseSummaryController from '../controllers/caseSummary/caseSummaryController'
import spoDeleteRecommendationController from '../controllers/recommendation/spoDeleteRecommendationController'
import spoRecallRationaleController from '../controllers/recommendation/spoRecallRationaleController'
import spoRecordDecisionController from '../controllers/recommendation/spoRecordDecisionController'
import spoRationaleConfirmationController from '../controllers/recommendation/spoRationaleConfirmationController'
import taskListNoRecallController from '../controllers/recommendation/taskListNoRecallController'
import taskListController from '../controllers/recommendation/taskListController'
import previewNoRecallLetterController from '../controllers/recommendation/previewNoRecallLetterController'
import confirmationNoRecallController from '../controllers/recommendation/confirmationNoRecallController'
import whyConsideredRecallController from '../controllers/recommendation/whyConsideredRecallController'
import reasonsNoRecallController from '../controllers/recommendation/reasonsNoRecallController'
import appointmentNoRecallController from '../controllers/recommendation/appointmentNoRecallController'
import managerReviewController from '../controllers/recommendation/managerReviewController'
import sensitiveInfoController from '../controllers/recommendation/sensitiveInfoController'
import custodyStatusController from '../controllers/recommendation/custodyStatusController'
import whatLedController from '../controllers/recommendation/whatLedController'
import requestSpoCountersignController from '../controllers/recommendation/requestSpoCountersignController'
import emergencyRecallController from '../controllers/recommendation/emergencyRecallController'
import personalDetailsController from '../controllers/recommendation/personalDetailsController'
import offenceDetailsController from '../controllers/recommendation/offenceDetailsController'
import mappaController from '../controllers/recommendation/mappaController'
import managerViewDecisionController from '../controllers/recommendation/managerViewDecisionController'
import managerDecisionConfirmationController from '../controllers/recommendation/managerDecisionConfirmationController'
import countersigningTelephoneController from '../controllers/recommendation/countersigningTelephoneController'
import managerCountersignatureController from '../controllers/recommendation/managerCountersignatureController'
import requestAcoCountersignController from '../controllers/recommendation/requestAcoCountersignController'
import countersignConfirmationController from '../controllers/recommendation/countersignConfirmationController'
import rationaleCheckController from '../controllers/recommendation/rationaleCheckController'
import confirmationPartAController from '../controllers/recommendation/confirmationPartAController'
import contrabandController from '../controllers/recommendation/contrabandController'
import addressDetailsController from '../controllers/recommendation/addressDetailsController'
import indeterminateDetailsController from '../controllers/recommendation/indeterminateDetailsController'
import fixedTermLicenceConditionsController from '../controllers/recommendation/fixedTermLicenceConditionsController'
import vulnerabilitiesController from '../controllers/recommendation/vulnerabilitiesController'
import iomController from '../controllers/recommendation/iomController'
import policeDetailsController from '../controllers/recommendation/policeDetailsController'
import victimContactSchemeController from '../controllers/recommendation/victimContactSchemeController'
import victimLiasonOfficerController from '../controllers/recommendation/victimLiasonOfficerController'
import whoCompletedPartAController from '../controllers/recommendation/whoCompletedPartAController'
import practitionerForPartAController from '../controllers/recommendation/practitionerForPartAController'
import revocationOrderRecipientsController from '../controllers/recommendation/revocationOrderRecipientsController'
import ppcsQueryEmailsController from '../controllers/recommendation/ppcsQueryEmailsController'
import arrestIssuesController from '../controllers/recommendation/arrestIssuesController'
import addPreviousReleaseController from '../controllers/recommendation/addPreviousReleaseController'
import addPreviousRecallController from '../controllers/recommendation/addPreviousRecallController'
import previousRecallController from '../controllers/recommendation/previousRecallsController'
import previousReleasesController from '../controllers/recommendation/previousReleasesController'
import offenceAnalysisController from '../controllers/recommendation/offenceAnalysisController'
import roshController from '../controllers/recommendation/roshController'
import previewPartAController from '../controllers/recommendation/previewPartAController'
import spoWhyNoRecallController from '../controllers/recommendation/spoWhyNoRecallController'
import spoSeniorManagerEndorsementController from '../controllers/recommendation/spoSeniorManagerEndorsementController'
import recallTypeExtendedController from '../controllers/recommendation/recallTypeExtendedController'
import alreadyExisting from '../controllers/recommendation/alreadyExisting'
import { and, flagIsActive, hasRole, not, or, statusIsActive } from '../middleware/check'
import ppcsConsiderRecallController from '../controllers/recommendation/searchPpudController'
import searchPpudResultsController from '../controllers/recommendation/searchPpudResultsController'
import checkBookingDetailsController from '../controllers/recommendation/checkBookingDetailsController'
import noSearchPpudResults from '../controllers/recommendation/noSearchPpudResults'
import selectIndexOffenceController from '../controllers/recommendation/selectIndexOffenceController'
import indexOffenceSelectedController from '../controllers/recommendation/indexOffenceSelectedController'
import bookedToPpudController from '../controllers/recommendation/bookedToPpudController'
import editPoliceContactController from '../controllers/recommendation/editPoliceContactController'
import editCustodyTypeController from '../controllers/recommendation/editCustodyTypeController'
import editRecallReceivedController from '../controllers/recommendation/editRecallReceivedController'
import matchIndexOffenceController from '../controllers/recommendation/matchIndexOffenceController'
import bookToPpudController from '../controllers/recommendation/bookToPpudController'
import editReleasingPrisonController from '../controllers/recommendation/editReleasingPrisonController'
import editMappaLevelController from '../controllers/recommendation/editMappaLevelController'
import editGenderController from '../controllers/recommendation/editGenderController'
import editEthnicityController from '../controllers/recommendation/editEthnicityController'
import editNameController from '../controllers/recommendation/editNameController'
import editDateOfBirthController from '../controllers/recommendation/editDateOfBirthController'
import editProbationAreaController from '../controllers/recommendation/editProbationAreaController'
import spoRecordDeleteRationaleController from '../controllers/recommendation/spoRecordDeleteRationaleController'
import spoDeleteConfirmationController from '../controllers/recommendation/spoDeleteConfirmationController'
import editCroController from '../controllers/recommendation/editCroController'

const recommendations = Router()

RouteBuilder.build(recommendations)
  .withRoles(or(hasRole(HMPPS_AUTH_ROLE.SPO), hasRole(HMPPS_AUTH_ROLE.PO)))
  .withCheck(
    or(
      and(not(hasRole(HMPPS_AUTH_ROLE.SPO)), not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED))),
      and(
        hasRole(HMPPS_AUTH_ROLE.SPO),
        or(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_CONSIDER_RECALL))
      )
    )
  )
  .get('', redirectController.get)

/*
 * This section contains the route for the Probation Practitioner (PP)
 */
const ppRouteBuilder = RouteBuilder.build(recommendations)
  .withRoles(and(hasRole(HMPPS_AUTH_ROLE.PO), not(hasRole(HMPPS_AUTH_ROLE.PPCS))))
  .withCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)))

ppRouteBuilder.get('already-existing', alreadyExisting.get)

ppRouteBuilder.get('task-list-consider-recall', taskListConsiderRecallController.get)
ppRouteBuilder.post('task-list-consider-recall', taskListConsiderRecallController.post)

ppRouteBuilder.get('trigger-leading-to-recall', triggerLeadingToRecallController.get)
ppRouteBuilder.post('trigger-leading-to-recall', triggerLeadingToRecallController.post)

ppRouteBuilder.get('response-to-probation', responseToProbationController.get)
ppRouteBuilder.post('response-to-probation', responseToProbationController.post)

ppRouteBuilder.get('licence-conditions', licenceConditionsController.get)
ppRouteBuilder.post('licence-conditions', licenceConditionsController.post)

ppRouteBuilder.get('alternatives-tried', alternativesToRecallTriedController.get)
ppRouteBuilder.post('alternatives-tried', alternativesToRecallTriedController.post)

ppRouteBuilder.get('indeterminate-type', indeterminateTypeController.get)
ppRouteBuilder.post('indeterminate-type', indeterminateTypeController.post)

ppRouteBuilder.get('is-indeterminate', isIndeterminateController.get)
ppRouteBuilder.post('is-indeterminate', isIndeterminateController.post)

ppRouteBuilder.get('is-extended', isExtendedController.get)
ppRouteBuilder.post('is-extended', isExtendedController.post)

ppRouteBuilder.get('share-case-with-manager', shareCaseWithManagerController.get)

ppRouteBuilder.get('share-case-with-admin', shareCaseWithAdminController.get)

ppRouteBuilder.get('discuss-with-manager', discussWithManagerController.get)

ppRouteBuilder.get('recall-type', recallTypeController.get)
ppRouteBuilder.post('recall-type', recallTypeController.post)

ppRouteBuilder.get('emergency-recall', emergencyRecallController.get)
ppRouteBuilder.post('emergency-recall', emergencyRecallController.post)

ppRouteBuilder.get('sensitive-info', sensitiveInfoController.get)

ppRouteBuilder.get('custody-status', custodyStatusController.get)
ppRouteBuilder.post('custody-status', custodyStatusController.post)

ppRouteBuilder.get('what-led', whatLedController.get)
ppRouteBuilder.post('what-led', whatLedController.post)

ppRouteBuilder.get('recall-type-indeterminate', recallTypeIndeterminateController.get)
ppRouteBuilder.post('recall-type-indeterminate', recallTypeIndeterminateController.post)

ppRouteBuilder.get('recall-type-extended', recallTypeExtendedController.get)
ppRouteBuilder.post('recall-type-extended', recallTypeExtendedController.post)

ppRouteBuilder.get('fixed-licence', fixedTermLicenceConditionsController.get)
ppRouteBuilder.post('fixed-licence', fixedTermLicenceConditionsController.post)

ppRouteBuilder.get('indeterminate-details', indeterminateDetailsController.get)
ppRouteBuilder.post('indeterminate-details', indeterminateDetailsController.post)

ppRouteBuilder.get('vulnerabilities', vulnerabilitiesController.get)
ppRouteBuilder.post('vulnerabilities', vulnerabilitiesController.post)

ppRouteBuilder.get('task-list-no-recall', taskListNoRecallController.get)

ppRouteBuilder.get('why-considered-recall', whyConsideredRecallController.get)
ppRouteBuilder.post('why-considered-recall', whyConsideredRecallController.post)

ppRouteBuilder.get('reasons-no-recall', reasonsNoRecallController.get)
ppRouteBuilder.post('reasons-no-recall', reasonsNoRecallController.post)

ppRouteBuilder.get('appointment-no-recall', appointmentNoRecallController.get)
ppRouteBuilder.post('appointment-no-recall', appointmentNoRecallController.post)

ppRouteBuilder.get('contraband', contrabandController.get)
ppRouteBuilder.post('contraband', contrabandController.post)

ppRouteBuilder.get('address-details', addressDetailsController.get)
ppRouteBuilder.post('address-details', addressDetailsController.post)

ppRouteBuilder.get('iom', iomController.get)
ppRouteBuilder.post('iom', iomController.post)

ppRouteBuilder.get('police-details', policeDetailsController.get)
ppRouteBuilder.post('police-details', policeDetailsController.post)

ppRouteBuilder.get('victim-contact-scheme', victimContactSchemeController.get)
ppRouteBuilder.post('victim-contact-scheme', victimContactSchemeController.post)

ppRouteBuilder.get('victim-liaison-officer', victimLiasonOfficerController.get)
ppRouteBuilder.post('victim-liaison-officer', victimLiasonOfficerController.post)

ppRouteBuilder.get('preview-no-recall', previewNoRecallLetterController.get)

ppRouteBuilder.get('confirmation-no-recall', confirmationNoRecallController.get)

ppRouteBuilder.get('manager-review', managerReviewController.get)

ppRouteBuilder.get('personal-details', personalDetailsController.get)

ppRouteBuilder.get('offence-details', offenceDetailsController.get)

ppRouteBuilder.get('mappa', mappaController.get)

ppRouteBuilder.get('manager-view-decision', managerViewDecisionController.get)

ppRouteBuilder.get('who-completed-part-a', whoCompletedPartAController.get)
ppRouteBuilder.post('who-completed-part-a', whoCompletedPartAController.post)

ppRouteBuilder.get('practitioner-for-part-a', practitionerForPartAController.get)
ppRouteBuilder.post('practitioner-for-part-a', practitionerForPartAController.post)

ppRouteBuilder.get('revocation-order-recipients', revocationOrderRecipientsController.get)
ppRouteBuilder.post('revocation-order-recipients', revocationOrderRecipientsController.post)

ppRouteBuilder.get('ppcs-query-emails', ppcsQueryEmailsController.get)
ppRouteBuilder.post('ppcs-query-emails', ppcsQueryEmailsController.post)

ppRouteBuilder.get('arrest-issues', arrestIssuesController.get)
ppRouteBuilder.post('arrest-issues', arrestIssuesController.post)

ppRouteBuilder.get('add-previous-release', addPreviousReleaseController.get)
ppRouteBuilder.post('add-previous-release', addPreviousReleaseController.post)

ppRouteBuilder.get('add-previous-recall', addPreviousRecallController.get)
ppRouteBuilder.post('add-previous-recall', addPreviousRecallController.post)

ppRouteBuilder.get('previous-recalls', previousRecallController.get)
ppRouteBuilder.post('previous-recalls', previousRecallController.post)

ppRouteBuilder.get('previous-releases', previousReleasesController.get)
ppRouteBuilder.post('previous-releases', previousReleasesController.post)

ppRouteBuilder.get('offence-analysis', offenceAnalysisController.get)
ppRouteBuilder.post('offence-analysis', offenceAnalysisController.post)

ppRouteBuilder.get('rosh', roshController.get)
ppRouteBuilder.post('rosh', roshController.post)

ppRouteBuilder.get('manager-decision-confirmation', managerDecisionConfirmationController.get)

ppRouteBuilder
  .withCheck(not(statusIsActive(STATUSES.SPO_SIGNED)))
  .get('request-spo-countersign', requestSpoCountersignController.get)

ppRouteBuilder
  .withCheck(and(statusIsActive(STATUSES.SPO_SIGNED), not(statusIsActive(STATUSES.ACO_SIGNED))))
  .get('request-aco-countersign', requestAcoCountersignController.get)

ppRouteBuilder
  .withRoles(
    and(
      hasRole(HMPPS_AUTH_ROLE.PO),
      not(hasRole(HMPPS_AUTH_ROLE.PPCS)),
      not(and(hasRole(HMPPS_AUTH_ROLE.SPO), flagIsActive('flagProbationAdmin')))
    )
  )
  .get('confirmation-part-a', confirmationPartAController.get)

ppRouteBuilder.get('preview-part-a', previewPartAController.get)

const spoRouteBuilder = ppRouteBuilder.withRoles(hasRole(HMPPS_AUTH_ROLE.SPO))

/*
 * This section contains the route for the Senior Probation Officer during the SPO Rationale journey.
 */
const spoRationaleRouteBuilder = spoRouteBuilder.withCheck(statusIsActive(STATUSES.SPO_CONSIDER_RECALL))

spoRationaleRouteBuilder.get('spo-task-list-consider-recall', spoTaskListConsiderRecallController.get)

spoRationaleRouteBuilder.get(`review-case/:crn/:sectionId`, caseSummaryController.get)
spoRationaleRouteBuilder.post(`review-case/:crn/:sectionId`, caseSummaryController.post)

spoRationaleRouteBuilder.get('review-practitioners-concerns', reviewPractitionersConcernsController.get)
spoRationaleRouteBuilder.post('review-practitioners-concerns', reviewPractitionersConcernsController.post)

spoRationaleRouteBuilder.get('spo-rationale', spoRecallRationaleController.get)
spoRationaleRouteBuilder.post('spo-rationale', spoRecallRationaleController.post)

spoRationaleRouteBuilder.get('spo-why-no-recall', spoWhyNoRecallController.get)
spoRationaleRouteBuilder.post('spo-why-no-recall', spoWhyNoRecallController.post)

spoRationaleRouteBuilder.get('spo-senior-manager-endorsement', spoSeniorManagerEndorsementController.get)

spoRationaleRouteBuilder.get('spo-record-decision', spoRecordDecisionController.get)
spoRationaleRouteBuilder.post('spo-record-decision', spoRecordDecisionController.post)

spoRationaleRouteBuilder
  .withCheck(statusIsActive(STATUSES.SPO_RECORDED_RATIONALE))
  .get('spo-rationale-confirmation', spoRationaleConfirmationController.get)

/*
 * This section contains the route for the Senior Probation Officer during the SPO Countersigning journey.
 * This journey includes the ACO as the ACOs do not currently have a distinct role assigned to them.
 */
const spoCounterSigningCheckRouteBuilder = spoRationaleRouteBuilder.withCheck(
  and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED))
)

spoCounterSigningCheckRouteBuilder.get('rationale-check', rationaleCheckController.get)
spoCounterSigningCheckRouteBuilder.post('rationale-check', rationaleCheckController.post)

const spoCounterSigningRouteBuilder = spoRationaleRouteBuilder.withCheck(
  and(
    not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)),
    or(statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED), statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED))
  )
)

spoCounterSigningRouteBuilder.get('countersigning-telephone', countersigningTelephoneController.get)
spoCounterSigningRouteBuilder.post('countersigning-telephone', countersigningTelephoneController.post)

spoCounterSigningRouteBuilder
  .withCheck(and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED)))
  .get('spo-countersignature', managerCountersignatureController.get)
spoCounterSigningRouteBuilder.post('spo-countersignature', managerCountersignatureController.post)

spoCounterSigningRouteBuilder
  .withCheck(and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED)))
  .get('aco-countersignature', managerCountersignatureController.get)
spoCounterSigningRouteBuilder.post('aco-countersignature', managerCountersignatureController.post)

spoCounterSigningRouteBuilder
  .withCheck(or(statusIsActive(STATUSES.SPO_SIGNED), statusIsActive(STATUSES.ACO_SIGNED)))
  .get('countersign-confirmation', countersignConfirmationController.get)

/*
 * The task-list page is accessed by many different roles under different circumstances.
 */
RouteBuilder.build(recommendations)
  .withRoles(or(hasRole(HMPPS_AUTH_ROLE.SPO), hasRole(HMPPS_AUTH_ROLE.PO)))
  .withCheck(
    and(
      not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)),
      or(
        not(hasRole(HMPPS_AUTH_ROLE.SPO)),
        and(
          hasRole(HMPPS_AUTH_ROLE.SPO),
          or(
            statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED),
            statusIsActive(STATUSES.SPO_SIGNED),
            statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED),
            statusIsActive(STATUSES.ACO_SIGNED)
          )
        )
      )
    )
  )
  .get('task-list', taskListController.get)

/*
 * This section contains the route for the Senior Probation Officer during the SPO Cancel Recommendation
 * Rationale journey.
 */

const spoCancelRouteBuilder = spoRouteBuilder.withCheck(
  or(not(statusIsActive(STATUSES.DELETED)), not(statusIsActive(STATUSES.REC_CLOSED)))
)

spoCancelRouteBuilder.get('spo-delete-recommendation-rationale', spoDeleteRecommendationController.get)
spoCancelRouteBuilder.post('spo-delete-recommendation-rationale', spoDeleteRecommendationController.post)
spoCancelRouteBuilder.get('record-delete-rationale', spoRecordDeleteRationaleController.get)
spoCancelRouteBuilder.post('record-delete-rationale', spoRecordDeleteRationaleController.post)

spoRationaleRouteBuilder
  .withCheck(or(statusIsActive(STATUSES.REC_CANCELLED), statusIsActive(STATUSES.REC_CLOSED)))
  .get('spo-delete-confirmation', spoDeleteConfirmationController.get)

const ppcsRouteBuilder = ppRouteBuilder
  .withRoles(hasRole(HMPPS_AUTH_ROLE.PPCS))
  .withCheck(and(statusIsActive(STATUSES.SENT_TO_PPCS), not(statusIsActive(STATUSES.REC_CLOSED))))

ppcsRouteBuilder.get('search-ppud', ppcsConsiderRecallController.get)
ppcsRouteBuilder.get('no-search-ppud-results', noSearchPpudResults.get)

ppcsRouteBuilder.get('search-ppud-results', searchPpudResultsController.get)
ppcsRouteBuilder.post('search-ppud-results', searchPpudResultsController.post)

ppcsRouteBuilder.get('check-booking-details', checkBookingDetailsController.get)
ppcsRouteBuilder.post('check-booking-details', checkBookingDetailsController.post)

ppcsRouteBuilder.get('edit-police-contact', editPoliceContactController.get)
ppcsRouteBuilder.post('edit-police-contact', editPoliceContactController.post)

ppcsRouteBuilder.get('edit-recall-received', editRecallReceivedController.get)
ppcsRouteBuilder.post('edit-recall-received', editRecallReceivedController.post)

ppcsRouteBuilder.get('select-index-offence', selectIndexOffenceController.get)
ppcsRouteBuilder.post('select-index-offence', selectIndexOffenceController.post)

ppcsRouteBuilder.get('index-offence-selected', indexOffenceSelectedController.get)
ppcsRouteBuilder.post('index-offence-selected', indexOffenceSelectedController.post)

ppcsRouteBuilder.get('match-index-offence', matchIndexOffenceController.get)
ppcsRouteBuilder.post('match-index-offence', matchIndexOffenceController.post)

ppcsRouteBuilder.get('edit-name', editNameController.get)
ppcsRouteBuilder.post('edit-name', editNameController.post)

ppcsRouteBuilder.get('edit-cro', editCroController.get)
ppcsRouteBuilder.post('edit-cro', editCroController.post)

ppcsRouteBuilder.get('edit-custody-type', editCustodyTypeController.get)
ppcsRouteBuilder.post('edit-custody-type', editCustodyTypeController.post)

ppcsRouteBuilder.get('edit-releasing-prison', editReleasingPrisonController.get)
ppcsRouteBuilder.post('edit-releasing-prison', editReleasingPrisonController.post)

ppcsRouteBuilder.get('edit-mappa-level', editMappaLevelController.get)
ppcsRouteBuilder.post('edit-mappa-level', editMappaLevelController.post)

ppcsRouteBuilder.get('edit-gender', editGenderController.get)
ppcsRouteBuilder.post('edit-gender', editGenderController.post)

ppcsRouteBuilder.get('edit-ethnicity', editEthnicityController.get)
ppcsRouteBuilder.post('edit-ethnicity', editEthnicityController.post)

ppcsRouteBuilder.get('edit-date-of-birth', editDateOfBirthController.get)
ppcsRouteBuilder.post('edit-date-of-birth', editDateOfBirthController.post)

ppcsRouteBuilder.get('edit-probation-area', editProbationAreaController.get)
ppcsRouteBuilder.post('edit-probation-area', editProbationAreaController.post)

ppcsRouteBuilder.get('book-to-ppud', bookToPpudController.get)

ppcsRouteBuilder.withCheck(statusIsActive(STATUSES.BOOKED_TO_PPUD)).get('booked-to-ppud', bookedToPpudController.get)

const get = (path: string, handler: RequestHandler) => recommendations.get(path, asyncMiddleware(handler))
const post = (path: string, handler: RequestHandler) => recommendations.post(path, asyncMiddleware(handler))
post('', createRecommendationController)
get(`/:recommendationId/documents/part-a`, createAndDownloadDocument('PART_A'))
get(`/:recommendationId/documents/preview-part-a`, createAndDownloadDocument('PREVIEW_PART_A'))
get(`/:recommendationId/documents/no-recall-letter`, createAndDownloadDocument('NO_RECALL_LETTER'))
post(`/:recommendationId/status`, updateRecommendationStatus)

export default recommendations
