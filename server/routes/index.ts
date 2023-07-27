import { RequestHandler, Router } from 'express'
import bodyParser from 'body-parser'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearchByCRN } from '../controllers/personSearch/personSearchByCRN'
import { personSearchByName } from '../controllers/personSearch/personSearchByName'
import { personSearchResults } from '../controllers/personSearch/personSearchResults'
import caseSummaryController from '../controllers/caseSummary/caseSummaryController'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { startPage } from '../controllers/startPage/startPage'
import { featureFlagsDefaults, readFeatureFlags } from '../middleware/featureFlags'
import { getFeatureFlags } from '../controllers/featureFlags'
import { downloadDocument } from '../controllers/downloadDocument'
import { routeUrls } from './routeUrls'
import { setAnalyticsId } from '../middleware/setAnalyticsId'
import { parseUrl } from '../middleware/parseUrl'
import { getCreateRecommendationWarning } from '../controllers/recommendations/getCreateRecommendationWarning'
import recommendations from './recommendations'
import { isPreprodOrProd } from '../utils/utils'
import replaceCurrentRecommendationController from '../controllers/recommendations/replaceCurrentRecommendationController'
import { personSearchResultsByName } from '../controllers/personSearch/personSearchResultsByName'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults), setAnalyticsId)

  router.use(`${routeUrls.recommendations}`, recommendations)
  get('/', startPage)
  get(routeUrls.accessibility, (req, res) => res.render('pages/accessibility'))
  if (!isPreprodOrProd(process.env.ENVIRONMENT)) {
    get(routeUrls.flags, getFeatureFlags)
  }
  get(routeUrls.searchByCRN, personSearchByCRN)
  get(routeUrls.searchByName, personSearchByName)
  get(routeUrls.searchResultsByCRN, personSearchResults)
  get(routeUrls.searchResultsByName, personSearchResultsByName)
  get(`${routeUrls.cases}/:crn/documents/:documentId`, downloadDocument)
  get(`${routeUrls.cases}/:crn/create-recommendation-warning`, getCreateRecommendationWarning)
  get(`${routeUrls.cases}/:crn/:sectionId`, caseSummaryController.get)
  get(`${routeUrls.cases}/:crn/replace-recommendation/:recommendationId`, replaceCurrentRecommendationController.get)
  return router
}
