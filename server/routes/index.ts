import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearch } from '../controllers/personSearch/personSearch'
import { personSearchResults } from '../controllers/personSearch/personSearchResults'
import { caseSummary } from '../controllers/caseSummary/caseSummary'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { startPage } from '../controllers/startPage/startPage'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  router.use(getStoredSessionData)
  get('/', startPage)
  get('/search', personSearch)
  get('/search-results', personSearchResults)
  get('/cases/:crn/:sectionId', caseSummary)

  return router
}
