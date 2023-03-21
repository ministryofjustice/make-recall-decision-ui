import { RequestHandler, Router } from 'express'
import bodyParser from 'body-parser'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearch } from '../controllers/personSearch/personSearch'
import { personSearchResults } from '../controllers/personSearch/personSearchResults'
import { caseSummary } from '../controllers/caseSummary/caseSummary'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { startPage } from '../controllers/startPage/startPage'
import { featureFlagsDefaults, readFeatureFlags } from '../middleware/featureFlags'
import { getFeatureFlags } from '../controllers/featureFlags'
import { downloadDocument } from '../controllers/downloadDocument'
import { routeUrls } from './routeUrls'
import { setAnalyticsId } from '../middleware/setAnalyticsId'
import { parseUrl } from '../middleware/parseUrl'
import { getConsiderRecall } from '../controllers/recommendations/getConsiderRecall'
import { postConsiderRecall } from '../controllers/recommendations/postConsiderRecall'
import { getCreateRecommendationWarning } from '../controllers/recommendations/getCreateRecommendationWarning'
import recommendations from './recommendations'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults), setAnalyticsId)

  router.use(`${routeUrls.recommendations}`, recommendations)
  get('/', startPage)
  get(routeUrls.accessibility, (req, res) => res.render('pages/accessibility'))
  get(routeUrls.flags, getFeatureFlags)
  get(routeUrls.search, personSearch)
  get(routeUrls.searchResults, personSearchResults)
  get(`${routeUrls.cases}/:crn/documents/:documentId`, downloadDocument)
  get(`${routeUrls.cases}/:crn/consider-recall`, getConsiderRecall)
  post(`${routeUrls.cases}/:crn/consider-recall`, postConsiderRecall)
  get(`${routeUrls.cases}/:crn/create-recommendation-warning`, getCreateRecommendationWarning)
  get(`${routeUrls.cases}/:crn/:sectionId`, caseSummary)

  return router
}
