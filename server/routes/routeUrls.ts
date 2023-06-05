export const routeUrls = {
  start: '/',
  search: '/search',
  searchResults: '/search-results',
  cases: '/cases',
  flags: ['test', 'development'].some(() => process.env.NODE_ENV) ? '/flags' : '/',
  recommendations: '/recommendations',
  accessibility: '/accessibility',
}
