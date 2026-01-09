import { Router } from 'express'
import bodyParser from 'body-parser'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { featureFlagsDefaults, readFeatureFlags } from '../middleware/featureFlags'
import { parseUrl } from '../middleware/parseUrl'
import { nothingMore } from './nothing-more'
import setUpMaintenance from '../middleware/setUpMaintenance'
import { authorisationCheck } from '../middleware/authorisationCheck'
import { hasRole, not, or } from '../middleware/check'
import type { RouteDefinition } from './standardRouter'
import { spoRoutes } from './routeDefinitions/spo.routes'
import { sharedRoutes } from './routeDefinitions/shared.routes'
import { ppcsRoutes } from './routeDefinitions/ppcs.routes'
import { ppRoutes } from './routeDefinitions/pp.routes'
import { apRoutes } from './routeDefinitions/ap.routes'

export default function routes(router: Router): Router {
  router.use(setUpMaintenance())
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults))

  const route = ({
    path,
    method,
    handler,
    roles = {},
    additionalMiddleware = [],
    afterMiddleware = [],
  }: RouteDefinition) => {
    const roleChecks = []

    if (roles.allow && roles.allow.length > 0) {
      // Checks that *any* of the "allow" roles are present
      roleChecks.push(authorisationCheck(or(...roles.allow.map(role => hasRole(role)))))
    }

    if (roles.deny && roles.deny.length > 0) {
      roleChecks.push(...roles.deny.map(role => authorisationCheck(not(hasRole(role)))))
    }

    router[method](
      path,
      ...roleChecks,
      ...additionalMiddleware.map(callback => asyncMiddleware(callback)),
      asyncMiddleware(handler),
      ...(afterMiddleware?.map(callback => asyncMiddleware(callback)) || []),
      nothingMore
    )
  }

  const routeSets = [sharedRoutes, ppcsRoutes, ppRoutes, spoRoutes, apRoutes]
  routeSets.map(routeSet => routeSet.map(routeDetails => route(routeDetails)))

  return router
}
