import { RouteDefinition } from '../standardRouter'
import apRationaleConfirmationController from '../../controllers/recommendation/apRationaleConfirmationController'
import apRecallRationaleController from '../../controllers/recommendation/apRecallRationaleController'
import apRecordDecisionController from '../../controllers/recommendation/apRecordDecisionController'
import apWhyNoRecallController from '../../controllers/recommendation/apWhyNoRecallController'
import licenceConditionsController from '../../controllers/recommendation/licenceConditionsController'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { not, statusIsActive } from '../../middleware/check'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { createRecommendationRouteTemplate, RECOMMENDATION_PREFIX } from '../recommendations'
import { apPaths } from '../paths/ap.paths'

const roles = {
  allow: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.RW, HMPPS_AUTH_ROLE.ODM],
}

const apGetTemplate = createRecommendationRouteTemplate(
  'get',
  [recommendationStatusCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)))],
  roles
)
const apPostTemplate = createRecommendationRouteTemplate(
  'post',
  [recommendationStatusCheck(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)))],
  roles
)

export const apRoutes: RouteDefinition[] = [
  {
    ...apGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apLicenceConditions}`,
    handler: licenceConditionsController.get,
  },
  {
    ...apPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apLicenceConditions}`,
    handler: licenceConditionsController.post,
  },
  {
    ...apGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apRecallRationale}`,
    handler: apRecallRationaleController.get,
  },
  {
    ...apPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apRecallRationale}`,
    handler: apRecallRationaleController.post,
  },
  {
    ...apGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apRecordDecision}`,
    handler: apRecordDecisionController.get,
  },
  {
    ...apPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apRecordDecision}`,
    handler: apRecordDecisionController.post,
  },
  {
    ...apGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apWhyNoRecall}`,
    handler: apWhyNoRecallController.get,
  },
  {
    ...apPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apWhyNoRecall}`,
    handler: apWhyNoRecallController.post,
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(statusIsActive(STATUSES.AP_RECORDED_RATIONALE))],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${apPaths.apRationaleConfirmation}`,
    handler: apRationaleConfirmationController.get,
  },
]
