import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearch } from '../controllers/personSearch/personSearch'
import { personSearchResults } from '../controllers/personSearch/personSearchResults'
import { caseSummary } from '../controllers/caseSummary/caseSummary'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { startPage } from '../controllers/startPage/startPage'
import { featureFlagsDefaults, readFeatureFlags } from '../middleware/featureFlags'
import { parseUrl } from '../middleware/parseUrl'
import { getFeatureFlags } from '../controllers/featureFlags'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults))
  get('/', startPage)
  get('/flags', getFeatureFlags)
  get('/search', personSearch)
  get('/search-results', personSearchResults)
  get('/cases/:crn/:sectionId', caseSummary)

  return router
}
