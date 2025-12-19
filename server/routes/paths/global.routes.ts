import type { RouteDefinition } from '..'
import { isPreprodOrProd } from '../../utils/utils'
import { startPage } from '../../controllers/startPage/startPage'
import { personSearchByCRN } from '../../controllers/personSearch/personSearchByCRN'
import { personSearchByName } from '../../controllers/personSearch/personSearchByName'
import { personSearchResults } from '../../controllers/personSearch/personSearchResults'
import { personSearchResultsByName } from '../../controllers/personSearch/personSearchResultsByName'
import { getFeatureFlags } from '../../controllers/featureFlags'
import { downloadDocument } from '../../controllers/downloadDocument'
import { getCreateRecommendationWarning } from '../../controllers/recommendations/getCreateRecommendationWarning'
import outOfHoursWarningController from '../../controllers/recommendations/outOfHoursWarningController'
import caseSummaryController from '../../controllers/caseSummary/caseSummaryController'
import replaceCurrentRecommendationController from '../../controllers/recommendations/replaceCurrentRecommendationController'

/**
 * All paths and routes which are not scoped to any users
 */

export const routeUrls = isPreprodOrProd(process.env.ENVIRONMENT)
  ? {
      start: '/',
      searchByCRN: '/search-by-crn',
      searchByName: '/search-by-name',
      searchResultsByCRN: '/search-results-by-crn',
      searchResultsByName: '/search-results-by-name',
      cases: '/cases',
      recommendations: '/recommendations',
      accessibility: '/accessibility',
    }
  : {
      start: '/',
      searchByCRN: '/search-by-crn',
      searchByName: '/search-by-name',
      searchResultsByCRN: '/search-results-by-crn',
      searchResultsByName: '/search-results-by-name',
      searchInPpud: '/search-in-ppud',
      cases: '/cases',
      flags: '/flags',
      recommendations: '/recommendations',
      accessibility: '/accessibility',
    }

export const caseUrls = {
  downloadDocument: `${routeUrls.cases}/:crn/documents/:documentId`,
  createRecommendationWarning: `${routeUrls.cases}/:crn/create-recommendation-warning`,
  outOfHoursWarning: `${routeUrls.cases}/:crn/out-of-hours-warning`,
  caseSummary: `${routeUrls.cases}/:crn/:sectionId`,
  replaceRecommendation: `${routeUrls.cases}/:crn/replace-recommendation/:recommendationId`,
}

const allEnvsRoutes: RouteDefinition[] = [
  { path: routeUrls.start, method: 'get', handler: startPage },
  { path: routeUrls.accessibility, method: 'get', handler: (req, res) => res.render('pages/accessibility') },
  { path: routeUrls.searchByCRN, method: 'get', handler: personSearchByCRN },
  { path: routeUrls.searchByName, method: 'get', handler: personSearchByName },
  { path: routeUrls.searchResultsByCRN, method: 'get', handler: personSearchResults },
  { path: routeUrls.searchResultsByName, method: 'get', handler: personSearchResultsByName },
  // Case-scoped routes
  { path: caseUrls.downloadDocument, method: 'get', handler: downloadDocument },
  { path: caseUrls.createRecommendationWarning, method: 'get', handler: getCreateRecommendationWarning },
  { path: caseUrls.outOfHoursWarning, method: 'get', handler: outOfHoursWarningController.get },
  { path: caseUrls.outOfHoursWarning, method: 'post', handler: outOfHoursWarningController.post },
  { path: caseUrls.caseSummary, method: 'get', handler: caseSummaryController.get },
  { path: caseUrls.replaceRecommendation, method: 'get', handler: replaceCurrentRecommendationController.get },
]

const devOnlyRoutes: RouteDefinition[] = [
  {
    path: routeUrls.flags,
    method: 'get',
    handler: getFeatureFlags,
  },
]

export const indexRoutes: RouteDefinition[] = [
  ...allEnvsRoutes,
  ...(!isPreprodOrProd(process.env.ENVIRONMENT) ? devOnlyRoutes : []),
]
