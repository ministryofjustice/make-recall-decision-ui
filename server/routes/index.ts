import type { RequestHandler, Router } from 'express'
import bodyParser from 'body-parser'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { personSearch } from '../controllers/personSearch/personSearch'
import { personSearchResults } from '../controllers/personSearch/personSearchResults'
import { caseSummary } from '../controllers/caseSummary/caseSummary'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { startPage } from '../controllers/startPage/startPage'
import { featureFlagsDefaults, readFeatureFlags } from '../middleware/featureFlags'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import { getFeatureFlags } from '../controllers/featureFlags'
import { recommendationFormGet, recommendationFormPost } from '../controllers/rec-prototype/recommendationForm'
import { downloadDocument } from '../controllers/downloadDocument'
import { createRecommendationController } from '../controllers/recommendations/createRecommendation'
import { getRecommendationPage } from '../controllers/recommendations/getRecommendationPage'
import { postRecommendationForm } from '../controllers/recommendations/postRecommendationForm'
import { routeUrls } from './routeUrls'
import { updateRecommendationStatus } from '../controllers/recommendations/updateRecommendationStatus'
import { createAndDownloadDocument } from '../controllers/recommendations/createAndDownloadDocument'
import { setAnalyticsId } from '../middleware/setAnalyticsId'
import { parseUrl } from '../middleware/parseUrl'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))

  router.use(parseUrl, getStoredSessionData, readFeatureFlags(featureFlagsDefaults), setAnalyticsId)
  get('/', startPage)
  get(routeUrls.flags, getFeatureFlags)
  get(routeUrls.search, personSearch)
  get(routeUrls.searchResults, personSearchResults)
  get(`${routeUrls.cases}/:crn/documents/:documentId`, downloadDocument)
  get(`${routeUrls.cases}/:crn/:sectionId`, caseSummary)

  post(routeUrls.recommendations, createRecommendationController)
  get(`${routeUrls.recommendations}/:recommendationId/documents/part-a`, createAndDownloadDocument('PART_A'))
  get(
    `${routeUrls.recommendations}/:recommendationId/documents/no-recall-letter`,
    createAndDownloadDocument('NO_RECALL_LETTER')
  )
  post(`${routeUrls.recommendations}/:recommendationId/status`, updateRecommendationStatus)
  router.get(
    `${routeUrls.recommendations}/:recommendationId/:pageUrlSlug`,
    asyncMiddleware(parseRecommendationUrl),
    asyncMiddleware(getRecommendationPage)
  )
  router.post(
    `${routeUrls.recommendations}/:recommendationId/:pageUrlSlug`,
    asyncMiddleware(parseRecommendationUrl),
    asyncMiddleware(postRecommendationForm)
  )

  // user research prototype
  get('/rec-prototype/:crn/:sectionId', recommendationFormGet)
  post('/rec-prototype/:crn/:sectionId', recommendationFormPost)

  return router
}
