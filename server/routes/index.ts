import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import bodyParser from 'body-parser'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { featureFlagsDefaults, readFeatureFlags } from '../middleware/featureFlags'
import { routeUrls } from './routeUrls'
import { parseUrl } from '../middleware/parseUrl'
import recommendations from './recommendations'
import { nothingMore } from './nothing-more'
import setUpMaintenance from '../middleware/setUpMaintenance'
import { ppcsRoutes } from './paths/ppcs.routes'
import { indexRoutes } from './paths/global.routes'

export type RouteDefinition = {
  path: string
  method: 'get' | 'post'
  handler: (req: Request, res: Response, next?: NextFunction) => void
  additionalMiddleware?: RequestHandler[]
}

export default function routes(router: Router): Router {
  router.use(setUpMaintenance())
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults))

  const route = ({ path, method, handler, additionalMiddleware = [] }: RouteDefinition) => {
    router[method](path, ...additionalMiddleware, asyncMiddleware(handler), nothingMore)
  }

  indexRoutes.map(routeDetails => route(routeDetails))
  ppcsRoutes.map(routeDetails => route(routeDetails))

  // Old format
  router.use(`${routeUrls.recommendations}`, recommendations)

  return router
}
