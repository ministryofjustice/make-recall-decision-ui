import { RouteDefinition } from '../standardRouter'
import audit from '../../controllers/audit'
import caseSummaryController from '../../controllers/caseSummary/caseSummaryController'
import customizeMessages from '../../controllers/customizeMessages'
import countersignConfirmationController from '../../controllers/recommendation/countersignConfirmationController'
import countersigningTelephoneController from '../../controllers/recommendation/countersigningTelephoneController'
import managerCountersignatureController from '../../controllers/recommendation/managerCountersignatureController'
import rationaleCheckController from '../../controllers/recommendation/rationaleCheckController'
import reviewPractitionersConcernsController from '../../controllers/recommendation/reviewPractitionersConcernsController'
import spoDeleteConfirmationController from '../../controllers/recommendation/spoDeleteConfirmationController'
import spoDeleteRecommendationController from '../../controllers/recommendation/spoDeleteRecommendationController'
import spoRationaleConfirmationController from '../../controllers/recommendation/spoRationaleConfirmationController'
import spoRecallRationaleController from '../../controllers/recommendation/spoRecallRationaleController'
import spoRecordDecisionController from '../../controllers/recommendation/spoRecordDecisionController'
import spoRecordDeleteRationaleController from '../../controllers/recommendation/spoRecordDeleteRationaleController'
import spoSeniorManagerEndorsementController from '../../controllers/recommendation/spoSeniorManagerEndorsementController'
import spoTaskListConsiderRecallController from '../../controllers/recommendation/spoTaskListConsiderRecallController'
import spoWhyNoRecallController from '../../controllers/recommendation/spoWhyNoRecallController'
import retrieveRecommendation from '../../controllers/retrieveRecommendation'
import retrieveStatuses from '../../controllers/retrieveStatuses'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { and, not, or, statusIsActive } from '../../middleware/check'
import { guardAgainstModifyingClosedRecommendation } from '../../middleware/guardAgainstModifyingClosedRecommendation'
import { parseRecommendationUrl } from '../../middleware/parseRecommendationUrl'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import {
  defaultRecommendationGetMiddleware,
  defaultRecommendationPostMiddleware,
  recommendationPrefix,
} from '../recommendations'
import { spoPaths } from '../paths/spo.paths'

const roles = {
  allow: [HMPPS_AUTH_ROLE.SPO],
}

/*
 * This section contains the route for the Senior Probation Officer during the SPO Rationale journey.
 */
const spoRationaleMiddleware = [recommendationStatusCheck(statusIsActive(STATUSES.SPO_CONSIDER_RECALL))]

const spoRationaleRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${spoPaths.spoTaskListConsiderRecall}`,
    method: 'get',
    handler: spoTaskListConsiderRecallController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.reviewCase}`,
    method: 'get',
    handler: caseSummaryController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.reviewCase}`,
    method: 'post',
    handler: caseSummaryController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.reviewPractitionersConcerns}`,
    method: 'get',
    handler: reviewPractitionersConcernsController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.reviewPractitionersConcerns}`,
    method: 'post',
    handler: reviewPractitionersConcernsController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoRationale}`,
    method: 'get',
    handler: spoRecallRationaleController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoRationale}`,
    method: 'post',
    handler: spoRecallRationaleController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoWhyNoRecall}`,
    method: 'get',
    handler: spoWhyNoRecallController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoWhyNoRecall}`,
    method: 'post',
    handler: spoWhyNoRecallController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoSeniorManagerEndorsement}`,
    method: 'get',
    handler: spoSeniorManagerEndorsementController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoRecordDecision}`,
    method: 'get',
    handler: spoRecordDecisionController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoRecordDecision}`,
    method: 'post',
    handler: spoRecordDecisionController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoRationaleMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoRationaleConfirmation}`,
    method: 'get',
    handler: spoRationaleConfirmationController.get,
    roles,
    // This one is a particularly strange route as it's actively working against
    // a lot of the other checks for recommendations, which previously wasn't obvious
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      recommendationStatusCheck(statusIsActive(STATUSES.SPO_RECORDED_RATIONALE)),
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
      customizeMessages,
    ],
    afterMiddleware: [audit],
  },
]

/*
 * This section contains the route for the Senior Probation Officer during the SPO Countersigning journey.
 * This journey includes the ACO as the ACOs do not currently have a distinct role assigned to them.
 */
const spoCounterSigningCheckRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${spoPaths.rationaleCheck}`,
    method: 'get',
    handler: rationaleCheckController.get,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationGetMiddleware,
      recommendationStatusCheck(
        and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED))
      ),
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.rationaleCheck}`,
    method: 'post',
    handler: rationaleCheckController.post,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationPostMiddleware,
      recommendationStatusCheck(
        and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED))
      ),
    ],
    afterMiddleware: [audit],
  },
]

const spoCounterSigningMiddleware = [
  recommendationStatusCheck(
    and(
      not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)),
      or(statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED), statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED))
    )
  ),
]

const spoCounterSigningRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${spoPaths.countersigningTelephone}`,
    method: 'get',
    handler: countersigningTelephoneController.get,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoCounterSigningMiddleware],
    roles,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.countersigningTelephone}`,
    method: 'post',
    handler: countersigningTelephoneController.post,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoCounterSigningMiddleware],
    roles,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoCountersignature}`,
    method: 'get',
    handler: managerCountersignatureController.get,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationGetMiddleware,
      recommendationStatusCheck(
        and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED))
      ),
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoCountersignature}`,
    method: 'post',
    handler: managerCountersignatureController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoCounterSigningMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.acoCountersignature}`,
    method: 'get',
    handler: managerCountersignatureController.get,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationGetMiddleware,
      recommendationStatusCheck(
        and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED))
      ),
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.acoCountersignature}`,
    method: 'post',
    handler: managerCountersignatureController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoCounterSigningMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.countersignConfirmation}`,
    method: 'get',
    handler: countersignConfirmationController.get,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationGetMiddleware,
      recommendationStatusCheck(or(statusIsActive(STATUSES.SPO_SIGNED), statusIsActive(STATUSES.ACO_SIGNED))),
    ],
    afterMiddleware: [audit],
  },
]

/*
 * This section contains the route for the Senior Probation Officer during the SPO Delete Recommendation
 * Rationale journey.
 */

const spoDeleteMiddleware = [
  recommendationStatusCheck(or(not(statusIsActive(STATUSES.DELETED)), not(statusIsActive(STATUSES.REC_CLOSED)))),
]

const spoDeleteRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${spoPaths.spoDeleteRecommendationRationale}`,
    method: 'get',
    handler: spoDeleteRecommendationController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoDeleteMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoDeleteRecommendationRationale}`,
    method: 'post',
    handler: spoDeleteRecommendationController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoDeleteMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.recordDeleteRationale}`,
    method: 'get',
    handler: spoRecordDeleteRationaleController.get,
    roles,
    additionalMiddleware: [...defaultRecommendationGetMiddleware, ...spoDeleteMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.recordDeleteRationale}`,
    method: 'post',
    handler: spoRecordDeleteRationaleController.post,
    roles,
    additionalMiddleware: [...defaultRecommendationPostMiddleware, ...spoDeleteMiddleware],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${spoPaths.spoDeleteConfirmation}`,
    method: 'get',
    handler: spoDeleteConfirmationController.get,
    roles,
    additionalMiddleware: [
      ...defaultRecommendationGetMiddleware,
      recommendationStatusCheck(or(statusIsActive(STATUSES.REC_DELETED), statusIsActive(STATUSES.REC_CLOSED))),
    ],
    afterMiddleware: [audit],
  },
]

export const spoRoutes: RouteDefinition[] = [
  ...spoRationaleRoutes,
  ...spoCounterSigningCheckRoutes,
  ...spoCounterSigningRoutes,
  ...spoDeleteRoutes,
]
