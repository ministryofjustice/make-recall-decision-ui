import ModuleRoutesHelper from '../../helpers/modules/routesHelper'
import { RouteDefinition } from '../../routes/standardRouter'
import Controller from './controller'

/**
 * Define routes and middleware here
 */
const routes: RouteDefinition[] = ModuleRoutesHelper.generateRoutes('/module-test', Controller)

export default routes
