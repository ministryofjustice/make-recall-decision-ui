import { RouteDefinition } from '../standardRouter'
import suitabilityForFixedTermRecallController from '../../controllers/recommendation/suitabilityForFixedTermRecallController'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { not, and, statusIsActive } from '../../middleware/check'
import audit from '../../controllers/audit'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import alreadyExistingController from '../../controllers/recommendation/alreadyExistingController'
import taskListConsiderRecallController from '../../controllers/recommendation/taskListConsiderRecallController'
import triggerLeadingToRecallController from '../../controllers/recommendation/triggerLeadingToRecallController'
import responseToProbationController from '../../controllers/recommendation/responseToProbationController'
import licenceConditionsController from '../../controllers/recommendation/licenceConditionsController'
import alternativesToRecallTriedController from '../../controllers/recommendation/alternativesToRecallTriedController'
import indeterminateTypeController from '../../controllers/recommendation/indeterminateTypeController'
import isIndeterminateController from '../../controllers/recommendation/isIndeterminateController'
import isExtendedController from '../../controllers/recommendation/isExtendedController'
import recordConsiderationRationaleController from '../../controllers/recommendation/recordConsiderationRationaleController'
import shareCaseWithManagerController from '../../controllers/recommendation/shareCaseWithManagerController'
import shareCaseWithAdminController from '../../controllers/recommendation/shareCaseWithAdminController'
import discussWithManagerController from '../../controllers/recommendation/discussWithManagerController'
import recallTypeController from '../../controllers/recommendation/recallTypeController'
import whenDidSpoAgreeDecision from '../../controllers/recommendation/whenDidSpoAgreeDecision'
import emergencyRecallController from '../../controllers/recommendation/emergencyRecallController'
import sensitiveInfoController from '../../controllers/recommendation/sensitiveInfoController'
import custodyStatusController from '../../controllers/recommendation/custodyStatusController'
import whatLedController from '../../controllers/recommendation/whatLedController'
import recallTypeIndeterminateController from '../../controllers/recommendation/recallTypeIndeterminateController'
import recallTypeExtendedController from '../../controllers/recommendation/recallTypeExtendedController'
import fixedTermLicenceConditionsController from '../../controllers/recommendation/fixedTermLicenceConditionsController'
import indeterminateDetailsController from '../../controllers/recommendation/indeterminateDetailsController'
import taskListNoRecallController from '../../controllers/recommendation/taskListNoRecallController'
import whyConsideredRecallController from '../../controllers/recommendation/whyConsideredRecallController'
import reasonsNoRecallController from '../../controllers/recommendation/reasonsNoRecallController'
import appointmentNoRecallController from '../../controllers/recommendation/appointmentNoRecallController'
import contrabandController from '../../controllers/recommendation/contrabandController'
import addressDetailsController from '../../controllers/recommendation/addressDetailsController'
import iomController from '../../controllers/recommendation/iomController'
import policeDetailsController from '../../controllers/recommendation/policeDetailsController'
import victimContactSchemeController from '../../controllers/recommendation/victimContactSchemeController'
import victimLiasonOfficerController from '../../controllers/recommendation/victimLiasonOfficerController'
import previewNoRecallLetterController from '../../controllers/recommendation/previewNoRecallLetterController'
import confirmationNoRecallController from '../../controllers/recommendation/confirmationNoRecallController'
import managerReviewController from '../../controllers/recommendation/managerReviewController'
import personalDetailsController from '../../controllers/recommendation/personalDetailsController'
import offenceDetailsController from '../../controllers/recommendation/offenceDetailsController'
import mappaController from '../../controllers/recommendation/mappaController'
import whoCompletedPartAController from '../../controllers/recommendation/whoCompletedPartAController'
import practitionerForPartAController from '../../controllers/recommendation/practitionerForPartAController'
import revocationOrderRecipientsController from '../../controllers/recommendation/revocationOrderRecipientsController'
import ppcsQueryEmailsController from '../../controllers/recommendation/ppcsQueryEmailsController'
import arrestIssuesController from '../../controllers/recommendation/arrestIssuesController'
import addPreviousReleaseController from '../../controllers/recommendation/addPreviousReleaseController'
import addPreviousRecallController from '../../controllers/recommendation/addPreviousRecallController'
import previousRecallsController from '../../controllers/recommendation/previousRecallsController'
import previousReleasesController from '../../controllers/recommendation/previousReleasesController'
import offenceAnalysisController from '../../controllers/recommendation/offenceAnalysisController'
import roshController from '../../controllers/recommendation/roshController'
import managerDecisionConfirmationController from '../../controllers/recommendation/managerDecisionConfirmationController'
import vulnerabilitiesController from '../../controllers/recommendation/vulnerabilitiesController'
import vulnerabilitiesDetailsController from '../../controllers/recommendation/vulnerabilitiesDetailsController'
import previewPartAController from '../../controllers/recommendation/previewPartAController'
import requestSpoCountersignController from '../../controllers/recommendation/requestSpoCountersignController'
import requestAcoCountersignController from '../../controllers/recommendation/requestAcoCountersignController'
import confirmationPartAController from '../../controllers/recommendation/confirmationPartAController'
import {
  defaultRecommendationGetMiddleware,
  defaultRecommendationPostMiddleware,
  recommendationPrefix,
} from '../recommendations'
import { ppPaths } from '../paths/pp.paths'

const roles = {
  allow: [HMPPS_AUTH_ROLE.PO],
  deny: [HMPPS_AUTH_ROLE.PPCS],
}

export const ppRecommendationRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${ppPaths.alreadyExisting}`,
    method: 'get',
    handler: alreadyExistingController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.taskListConsiderRecall}`,
    method: 'get',
    handler: taskListConsiderRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.taskListConsiderRecall}`,
    method: 'post',
    handler: taskListConsiderRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.triggerLeadingToRecall}`,
    method: 'get',
    handler: triggerLeadingToRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.triggerLeadingToRecall}`,
    method: 'post',
    handler: triggerLeadingToRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.suitabilityForFixedTermRecall}`,
    method: 'get',
    handler: suitabilityForFixedTermRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.suitabilityForFixedTermRecall}`,
    method: 'post',
    handler: suitabilityForFixedTermRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.responseToProbation}`,
    method: 'get',
    handler: responseToProbationController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.responseToProbation}`,
    method: 'post',
    handler: responseToProbationController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.licenceConditions}`,
    method: 'get',
    handler: licenceConditionsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.licenceConditions}`,
    method: 'post',
    handler: licenceConditionsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.alternativesTried}`,
    method: 'get',
    handler: alternativesToRecallTriedController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.alternativesTried}`,
    method: 'post',
    handler: alternativesToRecallTriedController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.indeterminateType}`,
    method: 'get',
    handler: indeterminateTypeController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.indeterminateType}`,
    method: 'post',
    handler: indeterminateTypeController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.isIndeterminate}`,
    method: 'get',
    handler: isIndeterminateController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.isIndeterminate}`,
    method: 'post',
    handler: isIndeterminateController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.isExtended}`,
    method: 'get',
    handler: isExtendedController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.isExtended}`,
    method: 'post',
    handler: isExtendedController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recordConsiderationRationale}`,
    method: 'get',
    handler: recordConsiderationRationaleController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recordConsiderationRationale}`,
    method: 'post',
    handler: recordConsiderationRationaleController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.shareCaseWithManager}`,
    method: 'get',
    handler: shareCaseWithManagerController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.shareCaseWithAdmin}`,
    method: 'get',
    handler: shareCaseWithAdminController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.discussWithManager}`,
    method: 'get',
    handler: discussWithManagerController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recallType}`,
    method: 'get',
    handler: recallTypeController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recallType}`,
    method: 'post',
    handler: recallTypeController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.spoAgreeToRecall}`,
    method: 'get',
    handler: whenDidSpoAgreeDecision.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.spoAgreeToRecall}`,
    method: 'post',
    handler: whenDidSpoAgreeDecision.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.emergencyRecall}`,
    method: 'get',
    handler: emergencyRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.emergencyRecall}`,
    method: 'post',
    handler: emergencyRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.sensitiveInfo}`,
    method: 'get',
    handler: sensitiveInfoController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.custodyStatus}`,
    method: 'get',
    handler: custodyStatusController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.custodyStatus}`,
    method: 'post',
    handler: custodyStatusController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.whatLed}`,
    method: 'get',
    handler: whatLedController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.whatLed}`,
    method: 'post',
    handler: whatLedController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recallTypeIndeterminate}`,
    method: 'get',
    handler: recallTypeIndeterminateController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recallTypeIndeterminate}`,
    method: 'post',
    handler: recallTypeIndeterminateController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recallTypeExtended}`,
    method: 'get',
    handler: recallTypeExtendedController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.recallTypeExtended}`,
    method: 'post',
    handler: recallTypeExtendedController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.fixedLicence}`,
    method: 'get',
    handler: fixedTermLicenceConditionsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.fixedLicence}`,
    method: 'post',
    handler: fixedTermLicenceConditionsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.indeterminateDetails}`,
    method: 'get',
    handler: indeterminateDetailsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.indeterminateDetails}`,
    method: 'post',
    handler: indeterminateDetailsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.taskListNoRecall}`,
    method: 'get',
    handler: taskListNoRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.whyConsideredRecall}`,
    method: 'get',
    handler: whyConsideredRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.whyConsideredRecall}`,
    method: 'post',
    handler: whyConsideredRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.reasonsNoRecall}`,
    method: 'get',
    handler: reasonsNoRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.reasonsNoRecall}`,
    method: 'post',
    handler: reasonsNoRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.appointmentNoRecall}`,
    method: 'get',
    handler: appointmentNoRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.appointmentNoRecall}`,
    method: 'post',
    handler: appointmentNoRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.contraband}`,
    method: 'get',
    handler: contrabandController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.contraband}`,
    method: 'post',
    handler: contrabandController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.addressDetails}`,
    method: 'get',
    handler: addressDetailsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.addressDetails}`,
    method: 'post',
    handler: addressDetailsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.iom}`,
    method: 'get',
    handler: iomController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.iom}`,
    method: 'post',
    handler: iomController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.policeDetails}`,
    method: 'get',
    handler: policeDetailsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.policeDetails}`,
    method: 'post',
    handler: policeDetailsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.victimContactScheme}`,
    method: 'get',
    handler: victimContactSchemeController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.victimContactScheme}`,
    method: 'post',
    handler: victimContactSchemeController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.victimLiaisonOfficer}`,
    method: 'get',
    handler: victimLiasonOfficerController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.victimLiaisonOfficer}`,
    method: 'post',
    handler: victimLiasonOfficerController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.previewNoRecall}`,
    method: 'get',
    handler: previewNoRecallLetterController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.confirmationNoRecall}`,
    method: 'get',
    handler: confirmationNoRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.managerReview}`,
    method: 'get',
    handler: managerReviewController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.personalDetails}`,
    method: 'get',
    handler: personalDetailsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.offenceDetails}`,
    method: 'get',
    handler: offenceDetailsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.mappa}`,
    method: 'get',
    handler: mappaController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.whoCompletedPartA}`,
    method: 'get',
    handler: whoCompletedPartAController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.whoCompletedPartA}`,
    method: 'post',
    handler: whoCompletedPartAController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.practitionerForPartA}`,
    method: 'get',
    handler: practitionerForPartAController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.practitionerForPartA}`,
    method: 'post',
    handler: practitionerForPartAController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.revocationOrderRecipients}`,
    method: 'get',
    handler: revocationOrderRecipientsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.revocationOrderRecipients}`,
    method: 'post',
    handler: revocationOrderRecipientsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.ppcsQueryEmails}`,
    method: 'get',
    handler: ppcsQueryEmailsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.ppcsQueryEmails}`,
    method: 'post',
    handler: ppcsQueryEmailsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.arrestIssues}`,
    method: 'get',
    handler: arrestIssuesController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.arrestIssues}`,
    method: 'post',
    handler: arrestIssuesController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.addPreviousRelease}`,
    method: 'get',
    handler: addPreviousReleaseController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.addPreviousRelease}`,
    method: 'post',
    handler: addPreviousReleaseController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.addPreviousRecall}`,
    method: 'get',
    handler: addPreviousRecallController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.addPreviousRecall}`,
    method: 'post',
    handler: addPreviousRecallController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.previousRecalls}`,
    method: 'get',
    handler: previousRecallsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.previousRecalls}`,
    method: 'post',
    handler: previousRecallsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.previousReleases}`,
    method: 'get',
    handler: previousReleasesController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.previousReleases}`,
    method: 'post',
    handler: previousReleasesController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.offenceAnalysis}`,
    method: 'get',
    handler: offenceAnalysisController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.offenceAnalysis}`,
    method: 'post',
    handler: offenceAnalysisController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.rosh}`,
    method: 'get',
    handler: roshController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.rosh}`,
    method: 'post',
    handler: roshController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.managerDecisionConfirmation}`,
    method: 'get',
    handler: managerDecisionConfirmationController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.vulnerabilities}`,
    method: 'get',
    handler: vulnerabilitiesController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.vulnerabilities}`,
    method: 'post',
    handler: vulnerabilitiesController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.vulnerabilitiesDetails}`,
    method: 'get',
    handler: vulnerabilitiesDetailsController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.vulnerabilitiesDetails}`,
    method: 'post',
    handler: vulnerabilitiesDetailsController.post,
    roles,
    additionalMiddleware: defaultRecommendationPostMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.previewPartA}`,
    method: 'get',
    handler: previewPartAController.get,
    roles,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.requestSpoCountersign}`,
    method: 'get',
    handler: requestSpoCountersignController.get,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationGetMiddleware,
      recommendationStatusCheck(not(statusIsActive(STATUSES.SPO_SIGNED))),
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.requestAcoCountersign}`,
    method: 'get',
    handler: requestAcoCountersignController.get,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationGetMiddleware,
      recommendationStatusCheck(and(statusIsActive(STATUSES.SPO_SIGNED), not(statusIsActive(STATUSES.ACO_SIGNED)))),
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${ppPaths.confirmationPartA}`,
    method: 'get',
    handler: confirmationPartAController.get,
    additionalMiddleware: defaultRecommendationGetMiddleware,
    roles: {
      allow: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO],
      deny: [HMPPS_AUTH_ROLE.PPCS],
    },
    afterMiddleware: [audit],
  },
]

export const ppRoutes: RouteDefinition[] = [...ppRecommendationRoutes]
