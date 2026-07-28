

import customizeMessages from '../../controllers/customizeMessages'
import ModuleRoutesHelper from '../../helpers/modules/routesHelper'
import { createRecommendationRouteTemplate, RECOMMENDATION_PREFIX } from '../../routes/recommendations'
import { RouteDefinition } from '../../routes/standardRouter'
import Controller from './controller'

/**
 * Define routes and middleware here
 */
// const routes: RouteDefinition[] = ModuleRoutesHelper.generateRoutes('/module-test', Controller)

const routes: RouteDefinition[] = [
  {
    ...createRecommendationRouteTemplate('get', [], {}),
    handler: Controller.get,
    path: `${RECOMMENDATION_PREFIX}/module-test`,
  },
]

export default routes
