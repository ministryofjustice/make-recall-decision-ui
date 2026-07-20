import { Router } from 'express'
import bodyParser from 'body-parser'

import asyncMiddleware from '../middleware/asyncMiddleware'
import getStoredSessionData from '../middleware/getStoredSessionData'
import { readFeatureFlags } from '../middleware/featureFlags'
import { authorisationCheck, hasRole, not, or } from '../middleware/check'
import parseUrl from '../middleware/parseUrl'
import setUpMaintenance from '../middleware/setUpMaintenance'
import nothingMore from './nothing-more'
import type { RouteDefinition } from './standardRouter'
import apRoutes from './routeDefinitions/ap.routes'
import ppcsRoutes from './routeDefinitions/ppcs.routes'
import { ppRoutes } from './routeDefinitions/pp.routes'
import { sharedRoutes } from './routeDefinitions/shared.routes'
import spoRoutes from './routeDefinitions/spo.routes'

export default function routes(router: Router): Router {
  router.use(setUpMaintenance())
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(parseUrl, getStoredSessionData, readFeatureFlags())

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
      nothingMore,
    )
  }

  const routeSets = [sharedRoutes, ppcsRoutes, ppRoutes, spoRoutes, apRoutes]
  routeSets.map(routeSet => routeSet.map(routeDetails => route(routeDetails)))

  return router
}
