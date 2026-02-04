import { isPreprodOrProd } from '../../utils/utils'
/**
 * All paths and routes which are not scoped to any users
 */

const allEnvs = {
  start: '/',
  searchByCRN: '/search-by-crn',
  searchByName: '/search-by-name',
  searchResultsByCRN: '/search-results-by-crn',
  searchResultsByName: '/search-results-by-name',
  cases: '/cases',
  recommendations: '/recommendations',
  accessibility: '/accessibility',
  taskList: 'task-list',
  downloadPartA: 'documents/part-a',
  downloadPreviewPartA: 'documents/preview-part-a',
  downloadNoRecallLetter: 'documents/no-recall-letter',
  recommendationStatus: 'status',
}

export const sharedPaths: typeof allEnvs & { searchInPpud?: string; flags?: string } = isPreprodOrProd(
  process.env.ENVIRONMENT
)
  ? // Pre-prod/Prod paths
    { ...allEnvs }
  : // Dev paths
    { ...allEnvs, searchInPpud: '/search-in-ppud', flags: '/flags' }

export const casePaths = {
  downloadDocument: `${sharedPaths.cases}/:crn/documents/:documentId`,
  createRecommendationWarning: `${sharedPaths.cases}/:crn/create-recommendation-warning`,
  outOfHoursWarning: `${sharedPaths.cases}/:crn/out-of-hours-warning`,
  caseSummary: `${sharedPaths.cases}/:crn/:sectionId`,
  replaceRecommendation: `${sharedPaths.cases}/:crn/replace-recommendation/:recommendationId`,
}
