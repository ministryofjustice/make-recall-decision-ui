import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearch } from '../middleware/personSearch'
import { personSearchResults } from '../middleware/personSearchResults'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', personSearch)
  get('/search-results', personSearchResults)

  return router
}
