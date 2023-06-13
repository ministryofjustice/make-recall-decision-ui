import { RequestHandler, Router } from 'express'
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { createRecommendationController } from '../controllers/recommendations/createRecommendation'
import { createAndDownloadDocument } from '../controllers/recommendations/createAndDownloadDocument'
import { updateRecommendationStatus } from '../controllers/recommendations/updateRecommendationStatus'
import { getRecommendationPage } from '../controllers/recommendations/getRecommendationPage'
import { postRecommendationForm } from '../controllers/recommendations/postRecommendationForm'
import { RouteBuilder } from './RouteBuilder'
import { and, not, or, roleIsActive, STATUSES, statusIsActive } from '../middleware/recommendationStatusCheck'
import taskListConsiderRecallController from '../controllers/recommendation/taskListConsiderRecallController'
import responseToProbationController from '../controllers/recommendation/responseToProbationController'
import licenceConditionsController from '../controllers/recommendation/licenceConditionsController'
import alternativesToRecallTriedController from '../controllers/recommendation/alternativesToRecallTriedController'
import triggerLeadingToRecallController from '../controllers/recommendation/triggerLeadingToRecallController'
import isIndeterminateController from '../controllers/recommendation/isIndeterminateController'
import isExtendedController from '../controllers/recommendation/isExtendedController'
import indeterminateTypeController from '../controllers/recommendation/indeterminateTypeController'
import shareCaseWithManagerController from '../controllers/recommendation/shareCaseWithManagerController'
import discussWithManagerController from '../controllers/recommendation/discussWithManagerController'
import recallTypeController from '../controllers/recommendation/recallTypeController'
import recallTypeIndeterminateController from '../controllers/recommendation/recallTypeIndeterminateController'
import redirectController from '../controllers/recommendation/redirectController'
import spoTaskListConsiderRecallController from '../controllers/recommendation/spoTaskListConsiderRecallController'
import reviewPractitionersConcernsController from '../controllers/recommendation/reviewPractitionersConcernsController'
import caseSummaryController from '../controllers/caseSummary/caseSummaryController'
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

const recommendations = Router()

/*
 * This section contains the route for the Probation Practitioner (PP)
 */
const ppRouteBuilder = RouteBuilder.build(recommendations)
  .withRoles([HMPPS_AUTH_ROLE.PO])
  .withCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)))

ppRouteBuilder.get('', redirectController.get)

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

ppRouteBuilder.get('preview-no-recall', previewNoRecallLetterController.get)

ppRouteBuilder.get('confirmation-no-recall', confirmationNoRecallController.get)

ppRouteBuilder.get('manager-review', managerReviewController.get)

ppRouteBuilder.get('personal-details', personalDetailsController.get)

ppRouteBuilder.get('offence-details', offenceDetailsController.get)

ppRouteBuilder.get('mappa', mappaController.get)

ppRouteBuilder.get('manager-view-decision', managerViewDecisionController.get)

ppRouteBuilder.get('manager-decision-confirmation', managerDecisionConfirmationController.get)

ppRouteBuilder
  .withCheck(not(statusIsActive(STATUSES.SPO_SIGNED)))
  .get('request-spo-countersign', requestSpoCountersignController.get)

ppRouteBuilder
  .withCheck(and(statusIsActive(STATUSES.SPO_SIGNED), not(statusIsActive(STATUSES.ACO_SIGNED))))
  .get('request-aco-countersign', requestAcoCountersignController.get)

ppRouteBuilder.get('confirmation-part-a', confirmationPartAController.get)

const spoRouteBuilder = ppRouteBuilder.withRoles([HMPPS_AUTH_ROLE.SPO])

/*
 * This section contains the route for the Senior Probation Officer during the SPO Rationale journey.
 */
const spoRationaleRouteBuilder = spoRouteBuilder.withCheck(
  or(statusIsActive(STATUSES.SPO_CONSIDER_RECALL), statusIsActive(STATUSES.SPO_CONSIDERING_RECALL))
)

spoRationaleRouteBuilder.get('spo-task-list-consider-recall', spoTaskListConsiderRecallController.get)

spoRationaleRouteBuilder.get(`review-case/:crn/:sectionId`, caseSummaryController.get)
spoRationaleRouteBuilder.post(`review-case/:crn/:sectionId`, caseSummaryController.post)

spoRationaleRouteBuilder.get('review-practitioners-concerns', reviewPractitionersConcernsController.get)
spoRationaleRouteBuilder.post('review-practitioners-concerns', reviewPractitionersConcernsController.post)

spoRationaleRouteBuilder.get('spo-rationale', spoRecallRationaleController.get)
spoRationaleRouteBuilder.post('spo-rationale', spoRecallRationaleController.post)

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

spoCounterSigningRouteBuilder.get('manager-countersignature', managerCountersignatureController.get)
spoCounterSigningRouteBuilder.post('manager-countersignature', managerCountersignatureController.post)

spoCounterSigningRouteBuilder
  .withCheck(or(statusIsActive(STATUSES.SPO_SIGNED), statusIsActive(STATUSES.ACO_SIGNED)))
  .get('countersign-confirmation', countersignConfirmationController.get)

/*
 * The task-list page is accessed by many different roles under different circumstances.
 */
RouteBuilder.build(recommendations)
  .withRoles([HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO])
  .withCheck(
    or(
      not(roleIsActive(HMPPS_AUTH_ROLE.SPO)),
      and(
        roleIsActive(HMPPS_AUTH_ROLE.SPO),
        or(
          statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED),
          statusIsActive(STATUSES.SPO_SIGNED),
          statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED),
          statusIsActive(STATUSES.ACO_SIGNED)
        )
      )
    )
  )
  .get('task-list', taskListController.get)

const get = (path: string, handler: RequestHandler) => recommendations.get(path, asyncMiddleware(handler))
const post = (path: string, handler: RequestHandler) => recommendations.post(path, asyncMiddleware(handler))
post('', createRecommendationController)
get(`/:recommendationId/documents/part-a`, createAndDownloadDocument('PART_A'))
get(`/:recommendationId/documents/no-recall-letter`, createAndDownloadDocument('NO_RECALL_LETTER'))
post(`/:recommendationId/status`, updateRecommendationStatus)

recommendations.get(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl, asyncMiddleware(getRecommendationPage))
recommendations.post(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl, asyncMiddleware(postRecommendationForm))

export default recommendations
