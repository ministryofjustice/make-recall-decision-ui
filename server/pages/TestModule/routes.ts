import retrieveRecommendation from '../../controllers/retrieveRecommendation'
import retrieveStatuses from '../../controllers/retrieveStatuses'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import guardAgainstModifyingClosedRecommendation from '../../middleware/guardAgainstModifyingClosedRecommendation'
import parseRecommendationUrl from '../../middleware/parseRecommendationUrl'
import { RouteDefinition } from '../../routes/standardRouter'
import Controller from './controller'

const RECOMMENDATION_PREFIX = '/recommendations/:recommendationId'

/**
 * Define routes and middleware here
 */

const path: string = `${RECOMMENDATION_PREFIX}/module-test`

const routes: RouteDefinition[] = [
  {
    method: 'get',
    roles: { allow: [HMPPS_AUTH_ROLE.PO] },
    handler: Controller.get,
    path,
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
    ],
  },
  {
    method: 'post',
    roles: { allow: [HMPPS_AUTH_ROLE.PO] },
    handler: Controller.post,
    path,
    additionalMiddleware: [retrieveStatuses, retrieveRecommendation, parseRecommendationUrl],
  },
]

export default routes
