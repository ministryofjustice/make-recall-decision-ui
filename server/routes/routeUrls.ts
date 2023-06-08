import { isPreprodOrProd } from '../utils/utils'

export const routeUrls = isPreprodOrProd(process.env.ENVIRONMENT)
  ? {
      start: '/',
      search: '/search',
      searchResults: '/search-results',
      cases: '/cases',
      recommendations: '/recommendations',
      accessibility: '/accessibility',
    }
  : {
      start: '/',
      search: '/search',
      searchResults: '/search-results',
      cases: '/cases',
      flags: '/flags',
      recommendations: '/recommendations',
      accessibility: '/accessibility',
    }
