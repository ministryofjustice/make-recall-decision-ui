import type { RequestHandler, Router } from 'express'
import bodyParser from 'body-parser'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearch } from '../controllers/personSearch/personSearch'
import { personSearchResults } from '../controllers/personSearch/personSearchResults'
import { caseSummary } from '../controllers/caseSummary/caseSummary'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { startPage } from '../controllers/startPage/startPage'
import { featureFlagsDefaults, readFeatureFlags } from '../middleware/featureFlags'
import { parseUrl } from '../middleware/parseUrl'
import { getFeatureFlags } from '../controllers/featureFlags'
import { contactSelectedHandler } from '../controllers/recommendation/contactSelectedHandler'
import { selectContactsPage } from '../controllers/recommendation/selectContactsPage'
import { recommendationFormGet, recommendationFormPost } from '../controllers/recommendation/recommendationForm'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))

  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults))
  get('/', startPage)
  get('/flags', getFeatureFlags)
  get('/search', personSearch)
  get('/search-results', personSearchResults)
  get('/cases/:crn/select-contacts', selectContactsPage)
  get('/cases/:crn/:sectionId', caseSummary)

  get('/recommendation/:crn/:sectionId', recommendationFormGet)
  post('/recommendation/:crn/:sectionId', recommendationFormPost)
  post('/select-component', contactSelectedHandler)

  return router
}
