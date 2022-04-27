import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearch } from '../middleware/personSearch'
import { personSearchResults } from '../middleware/personSearchResults'
import { caseSummary } from '../middleware/caseSummary'
import { startPage } from '../middleware/startPage'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', startPage)
  get('/search', personSearch)
  get('/search-results', personSearchResults)
  get('/cases/:crn/:sectionId', caseSummary)

  return router
}
