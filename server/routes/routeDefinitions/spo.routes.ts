import { RouteDefinition } from '../standardRouter'
import caseSummaryController from '../../controllers/caseSummary/caseSummaryController'
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
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { and, not, or, statusIsActive } from '../../middleware/check'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { createRecommendationRouteTemplate, RECOMMENDATION_PREFIX } from '../recommendations'
import { spoPaths } from '../paths/spo.paths'

const roles = {
  allow: [HMPPS_AUTH_ROLE.SPO],
}

/*
 * This section contains the route for the Senior Probation Officer during the SPO Rationale journey.
 */
const spoRationaleMiddleware = [recommendationStatusCheck(statusIsActive(STATUSES.SPO_CONSIDER_RECALL))]
const spoRouteGetTemplate = createRecommendationRouteTemplate('get', spoRationaleMiddleware, roles)
const spoRoutePostTemplate = createRecommendationRouteTemplate('post', spoRationaleMiddleware, roles)

const spoRationaleRoutes: RouteDefinition[] = [
  {
    ...spoRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoTaskListConsiderRecall}`,
    handler: spoTaskListConsiderRecallController.get,
  },
  {
    ...spoRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.reviewCase}`,
    handler: caseSummaryController.get,
  },
  {
    ...spoRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.reviewCase}`,
    handler: caseSummaryController.post,
  },
  {
    ...spoRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.reviewPractitionersConcerns}`,
    handler: reviewPractitionersConcernsController.get,
  },
  {
    ...spoRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.reviewPractitionersConcerns}`,
    handler: reviewPractitionersConcernsController.post,
  },
  {
    ...spoRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoRationale}`,
    handler: spoRecallRationaleController.get,
  },
  {
    ...spoRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoRationale}`,
    handler: spoRecallRationaleController.post,
  },
  {
    ...spoRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoWhyNoRecall}`,
    handler: spoWhyNoRecallController.get,
  },
  {
    ...spoRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoWhyNoRecall}`,
    handler: spoWhyNoRecallController.post,
  },
  {
    ...spoRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoSeniorManagerEndorsement}`,
    handler: spoSeniorManagerEndorsementController.get,
  },
  {
    ...spoRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoRecordDecision}`,
    handler: spoRecordDecisionController.get,
  },
  {
    ...spoRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoRecordDecision}`,
    handler: spoRecordDecisionController.post,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(statusIsActive(STATUSES.SPO_RECORDED_RATIONALE))],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoRationaleConfirmation}`,
    handler: spoRationaleConfirmationController.get,
  },
]

/*
 * This section contains the route for the Senior Probation Officer during the SPO Countersigning journey.
 * This journey includes the ACO as the ACOs do not currently have a distinct role assigned to them.
 */
const spoCounterSigningCheckRoutes: RouteDefinition[] = [
  {
    ...createRecommendationRouteTemplate(
      'get',
      [
        recommendationStatusCheck(
          and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED))
        ),
      ],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.rationaleCheck}`,
    handler: rationaleCheckController.get,
  },
  {
    ...createRecommendationRouteTemplate(
      'post',
      [
        recommendationStatusCheck(
          and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED))
        ),
      ],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.rationaleCheck}`,
    handler: rationaleCheckController.post,
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

const spoCountersigingRouteGetTemplate = createRecommendationRouteTemplate('get', spoCounterSigningMiddleware, roles)
const spoCountersigingRoutePostTemplate = createRecommendationRouteTemplate('post', spoCounterSigningMiddleware, roles)

const spoCounterSigningRoutes: RouteDefinition[] = [
  {
    ...spoCountersigingRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.countersigningTelephone}`,
    handler: countersigningTelephoneController.get,
  },
  {
    ...spoCountersigingRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.countersigningTelephone}`,
    handler: countersigningTelephoneController.post,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [
        recommendationStatusCheck(
          and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED))
        ),
      ],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoCountersignature}`,
    handler: managerCountersignatureController.get,
  },
  {
    ...spoCountersigingRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoCountersignature}`,
    handler: managerCountersignatureController.post,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [
        recommendationStatusCheck(
          and(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED))
        ),
      ],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.acoCountersignature}`,
    handler: managerCountersignatureController.get,
  },
  {
    ...spoCountersigingRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.acoCountersignature}`,
    handler: managerCountersignatureController.post,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(or(statusIsActive(STATUSES.SPO_SIGNED), statusIsActive(STATUSES.ACO_SIGNED)))],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.countersignConfirmation}`,
    handler: countersignConfirmationController.get,
  },
]

/*
 * This section contains the route for the Senior Probation Officer during the SPO Delete Recommendation
 * Rationale journey.
 */
const spoDeleteMiddleware = [
  recommendationStatusCheck(or(not(statusIsActive(STATUSES.DELETED)), not(statusIsActive(STATUSES.REC_CLOSED)))),
]

const spoDeleteRouteGetTemplate = createRecommendationRouteTemplate('get', spoDeleteMiddleware, roles)
const spoDeleteRoutePostTemplate = createRecommendationRouteTemplate('post', spoDeleteMiddleware, roles)

const spoDeleteRoutes: RouteDefinition[] = [
  {
    ...spoDeleteRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoDeleteRecommendationRationale}`,
    handler: spoDeleteRecommendationController.get,
  },
  {
    ...spoDeleteRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoDeleteRecommendationRationale}`,
    handler: spoDeleteRecommendationController.post,
  },
  {
    ...spoDeleteRouteGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.recordDeleteRationale}`,
    handler: spoRecordDeleteRationaleController.get,
  },
  {
    ...spoDeleteRoutePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.recordDeleteRationale}`,
    handler: spoRecordDeleteRationaleController.post,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(or(statusIsActive(STATUSES.REC_DELETED), statusIsActive(STATUSES.REC_CLOSED)))],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${spoPaths.spoDeleteConfirmation}`,
    handler: spoDeleteConfirmationController.get,
  },
]

export const spoRoutes: RouteDefinition[] = [
  ...spoRationaleRoutes,
  ...spoCounterSigningCheckRoutes,
  ...spoCounterSigningRoutes,
  ...spoDeleteRoutes,
]
