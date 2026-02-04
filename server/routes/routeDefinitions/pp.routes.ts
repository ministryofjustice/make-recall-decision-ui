import { RouteDefinition } from '../standardRouter'
import suitabilityForFixedTermRecallController from '../../controllers/recommendation/suitabilityForFixedTermRecallController'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { not, and, statusIsActive } from '../../middleware/check'
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
import { createRecommendationRouteTemplate, RECOMMENDATION_PREFIX } from '../recommendations'
import { ppPaths } from '../paths/pp.paths'

const roles = {
  allow: [HMPPS_AUTH_ROLE.PO],
  deny: [HMPPS_AUTH_ROLE.PPCS],
}

const ppGetTemplate = createRecommendationRouteTemplate(
  'get',
  [recommendationStatusCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)))],
  roles
)
const ppPostTemplate = createRecommendationRouteTemplate(
  'post',
  [recommendationStatusCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)))],
  roles
)

export const ppRecommendationRoutes: RouteDefinition[] = [
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.alreadyExisting}`,
    handler: alreadyExistingController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.taskListConsiderRecall}`,
    handler: taskListConsiderRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.taskListConsiderRecall}`,
    handler: taskListConsiderRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.triggerLeadingToRecall}`,
    handler: triggerLeadingToRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.triggerLeadingToRecall}`,
    handler: triggerLeadingToRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.suitabilityForFixedTermRecall}`,
    handler: suitabilityForFixedTermRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.suitabilityForFixedTermRecall}`,
    handler: suitabilityForFixedTermRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.responseToProbation}`,
    handler: responseToProbationController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.responseToProbation}`,
    handler: responseToProbationController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.licenceConditions}`,
    handler: licenceConditionsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.licenceConditions}`,
    handler: licenceConditionsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.alternativesTried}`,
    handler: alternativesToRecallTriedController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.alternativesTried}`,
    handler: alternativesToRecallTriedController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.indeterminateType}`,
    handler: indeterminateTypeController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.indeterminateType}`,
    handler: indeterminateTypeController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.isIndeterminate}`,
    handler: isIndeterminateController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.isIndeterminate}`,
    handler: isIndeterminateController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.isExtended}`,
    handler: isExtendedController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.isExtended}`,
    handler: isExtendedController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recordConsiderationRationale}`,
    handler: recordConsiderationRationaleController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recordConsiderationRationale}`,
    handler: recordConsiderationRationaleController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.shareCaseWithManager}`,
    handler: shareCaseWithManagerController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.shareCaseWithAdmin}`,
    handler: shareCaseWithAdminController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.discussWithManager}`,
    handler: discussWithManagerController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recallType}`,
    handler: recallTypeController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recallType}`,
    handler: recallTypeController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.spoAgreeToRecall}`,
    handler: whenDidSpoAgreeDecision.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.spoAgreeToRecall}`,
    handler: whenDidSpoAgreeDecision.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.emergencyRecall}`,
    handler: emergencyRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.emergencyRecall}`,
    handler: emergencyRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.sensitiveInfo}`,
    handler: sensitiveInfoController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.custodyStatus}`,
    handler: custodyStatusController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.custodyStatus}`,
    handler: custodyStatusController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.whatLed}`,
    handler: whatLedController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.whatLed}`,
    handler: whatLedController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recallTypeIndeterminate}`,
    handler: recallTypeIndeterminateController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recallTypeIndeterminate}`,
    handler: recallTypeIndeterminateController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recallTypeExtended}`,
    handler: recallTypeExtendedController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.recallTypeExtended}`,
    handler: recallTypeExtendedController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.fixedLicence}`,
    handler: fixedTermLicenceConditionsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.fixedLicence}`,
    handler: fixedTermLicenceConditionsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.indeterminateDetails}`,
    handler: indeterminateDetailsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.indeterminateDetails}`,
    handler: indeterminateDetailsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.taskListNoRecall}`,
    handler: taskListNoRecallController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.whyConsideredRecall}`,
    handler: whyConsideredRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.whyConsideredRecall}`,
    handler: whyConsideredRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.reasonsNoRecall}`,
    handler: reasonsNoRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.reasonsNoRecall}`,
    handler: reasonsNoRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.appointmentNoRecall}`,
    handler: appointmentNoRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.appointmentNoRecall}`,
    handler: appointmentNoRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.contraband}`,
    handler: contrabandController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.contraband}`,
    handler: contrabandController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.addressDetails}`,
    handler: addressDetailsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.addressDetails}`,
    handler: addressDetailsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.iom}`,
    handler: iomController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.iom}`,
    handler: iomController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.policeDetails}`,
    handler: policeDetailsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.policeDetails}`,
    handler: policeDetailsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.victimContactScheme}`,
    handler: victimContactSchemeController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.victimContactScheme}`,
    handler: victimContactSchemeController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.victimLiaisonOfficer}`,
    handler: victimLiasonOfficerController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.victimLiaisonOfficer}`,
    handler: victimLiasonOfficerController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.previewNoRecall}`,
    handler: previewNoRecallLetterController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.confirmationNoRecall}`,
    handler: confirmationNoRecallController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.managerReview}`,
    handler: managerReviewController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.personalDetails}`,
    handler: personalDetailsController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.offenceDetails}`,
    handler: offenceDetailsController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.mappa}`,
    handler: mappaController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.whoCompletedPartA}`,
    handler: whoCompletedPartAController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.whoCompletedPartA}`,
    handler: whoCompletedPartAController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.practitionerForPartA}`,
    handler: practitionerForPartAController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.practitionerForPartA}`,
    handler: practitionerForPartAController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.revocationOrderRecipients}`,
    handler: revocationOrderRecipientsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.revocationOrderRecipients}`,
    handler: revocationOrderRecipientsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.ppcsQueryEmails}`,
    handler: ppcsQueryEmailsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.ppcsQueryEmails}`,
    handler: ppcsQueryEmailsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.arrestIssues}`,
    handler: arrestIssuesController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.arrestIssues}`,
    handler: arrestIssuesController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.addPreviousRelease}`,
    handler: addPreviousReleaseController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.addPreviousRelease}`,
    handler: addPreviousReleaseController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.addPreviousRecall}`,
    handler: addPreviousRecallController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.addPreviousRecall}`,
    handler: addPreviousRecallController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.previousRecalls}`,
    handler: previousRecallsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.previousRecalls}`,
    handler: previousRecallsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.previousReleases}`,
    handler: previousReleasesController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.previousReleases}`,
    handler: previousReleasesController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.offenceAnalysis}`,
    handler: offenceAnalysisController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.offenceAnalysis}`,
    handler: offenceAnalysisController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.rosh}`,
    handler: roshController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.rosh}`,
    handler: roshController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.managerDecisionConfirmation}`,
    handler: managerDecisionConfirmationController.get,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.vulnerabilities}`,
    handler: vulnerabilitiesController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.vulnerabilities}`,
    handler: vulnerabilitiesController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.vulnerabilitiesDetails}`,
    handler: vulnerabilitiesDetailsController.get,
  },
  {
    ...ppPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.vulnerabilitiesDetails}`,
    handler: vulnerabilitiesDetailsController.post,
  },
  {
    ...ppGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.previewPartA}`,
    handler: previewPartAController.get,
  },
  // Non-default middleware routes
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(not(statusIsActive(STATUSES.SPO_SIGNED)))],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.requestSpoCountersign}`,
    handler: requestSpoCountersignController.get,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(and(statusIsActive(STATUSES.SPO_SIGNED), not(statusIsActive(STATUSES.ACO_SIGNED))))],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.requestAcoCountersign}`,
    handler: requestAcoCountersignController.get,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)))],
      {
        allow: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO],
        deny: [HMPPS_AUTH_ROLE.PPCS],
      }
    ),
    path: `${RECOMMENDATION_PREFIX}/${ppPaths.confirmationPartA}`,
    handler: confirmationPartAController.get,
  },
]

export const ppRoutes: RouteDefinition[] = [...ppRecommendationRoutes]
