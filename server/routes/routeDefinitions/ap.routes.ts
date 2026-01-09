import { RouteDefinition } from '../standardRouter'
import audit from '../../controllers/audit'
import customizeMessages from '../../controllers/customizeMessages'
import apRationaleConfirmationController from '../../controllers/recommendation/apRationaleConfirmationController'
import apRecallRationaleController from '../../controllers/recommendation/apRecallRationaleController'
import apRecordDecisionController from '../../controllers/recommendation/apRecordDecisionController'
import apWhyNoRecallController from '../../controllers/recommendation/apWhyNoRecallController'
import licenceConditionsController from '../../controllers/recommendation/licenceConditionsController'
import retrieveRecommendation from '../../controllers/retrieveRecommendation'
import retrieveStatuses from '../../controllers/retrieveStatuses'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { not, statusIsActive } from '../../middleware/check'
import { guardAgainstModifyingClosedRecommendation } from '../../middleware/guardAgainstModifyingClosedRecommendation'
import { parseRecommendationUrl } from '../../middleware/parseRecommendationUrl'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { recommendationPrefix } from '../recommendations'
import { apPaths } from '../paths/ap.paths'

const apRouteMiddleware = [
  retrieveStatuses,
  retrieveRecommendation,
  recommendationStatusCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED))),
  parseRecommendationUrl,
  guardAgainstModifyingClosedRecommendation,
  customizeMessages,
]

const roles = {
  allow: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.RW, HMPPS_AUTH_ROLE.ODM],
}

export const apRoutes: RouteDefinition[] = [
  {
    path: `${recommendationPrefix}/${apPaths.apLicenceConditions}`,
    method: 'get',
    handler: licenceConditionsController.get,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apLicenceConditions}`,
    method: 'post',
    handler: licenceConditionsController.post,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apRecallRationale}`,
    method: 'get',
    handler: apRecallRationaleController.get,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apRecallRationale}`,
    method: 'post',
    handler: apRecallRationaleController.post,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apRecordDecision}`,
    method: 'get',
    handler: apRecordDecisionController.get,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apRecordDecision}`,
    method: 'post',
    handler: apRecordDecisionController.post,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apWhyNoRecall}`,
    method: 'get',
    handler: apWhyNoRecallController.get,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apWhyNoRecall}`,
    method: 'post',
    handler: apWhyNoRecallController.post,
    roles,
    additionalMiddleware: apRouteMiddleware,
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${apPaths.apRationaleConfirmation}`,
    method: 'get',
    handler: apRationaleConfirmationController.get,
    roles,
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      recommendationStatusCheck(statusIsActive(STATUSES.AP_RECORDED_RATIONALE)),
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
      customizeMessages,
    ],
  },
]
