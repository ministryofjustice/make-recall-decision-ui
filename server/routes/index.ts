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
import { parseUrl } from '../middleware/parseUrl'
import { getCreateRecommendationWarning } from '../controllers/recommendations/getCreateRecommendationWarning'
import recommendations from './recommendations'
import { isPreprodOrProd } from '../utils/utils'
import replaceCurrentRecommendationController from '../controllers/recommendations/replaceCurrentRecommendationController'
import { personSearchResultsByName } from '../controllers/personSearch/personSearchResultsByName'
import ppcsSearch from '../controllers/personSearch/ppcsSearchController'
import { nothingMore } from './nothing-more'
import ppcsSearchResultsController from '../controllers/personSearch/ppcsSearchResultsController'
import noPpcsSearchResultsController from '../controllers/personSearch/noPpcsSearchResultsController'
import outOfHoursWarningController from '../controllers/recommendations/outOfHoursWarningController'
import setUpMaintenance from '../middleware/setUpMaintenance'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler), nothingMore)
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler), nothingMore)

  router.use(setUpMaintenance())

  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults))

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
  get('/ppcs-search', ppcsSearch.get)
  get('/ppcs-search-results', ppcsSearchResultsController.get)
  get('/no-ppcs-search-results', noPpcsSearchResultsController.get)

  get(`${routeUrls.cases}/:crn/documents/:documentId`, downloadDocument)
  get(`${routeUrls.cases}/:crn/create-recommendation-warning`, getCreateRecommendationWarning)
  get(`${routeUrls.cases}/:crn/out-of-hours-warning`, outOfHoursWarningController.get)
  post(`${routeUrls.cases}/:crn/out-of-hours-warning`, outOfHoursWarningController.post)
  get(`${routeUrls.cases}/:crn/:sectionId`, caseSummaryController.get)
  get(`${routeUrls.cases}/:crn/replace-recommendation/:recommendationId`, replaceCurrentRecommendationController.get)
  return router
}
