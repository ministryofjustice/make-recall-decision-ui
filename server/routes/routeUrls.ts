import { isPreprodOrProd } from '../utils/utils'

export const routeUrls = isPreprodOrProd(process.env.ENVIRONMENT)
  ? {
      start: '/',
      findaRecallRequestByCRN: '/find-a-recall-request-by-crn',
      findaRecallRequestByName: '/find-a-recall-request-by-name',
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
      findaRecallRequestByCRN: '/find-a-recall-request-by-crn',
      findaRecallRequestByName: '/find-a-recall-request-by-name',
      searchByCRN: '/search-by-crn',
      searchByName: '/search-by-name',
      searchResultsByCRN: '/search-results-by-crn',
      searchResultsByName: '/search-results-by-name',
      cases: '/cases',
      flags: '/flags',
      recommendations: '/recommendations',
      accessibility: '/accessibility',
    }
