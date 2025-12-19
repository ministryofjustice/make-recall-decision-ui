import ppcsSearchController from '../../controllers/personSearch/ppcsSearchController'
import ppcsSearchResultsController from '../../controllers/personSearch/ppcsSearchResultsController'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { checkRole } from '../../middleware/check'
import noPpcsSearchResultsController from '../../controllers/personSearch/noPpcsSearchResultsController'
import type { RouteDefinition } from '../index'

/**
 * All paths/routes which are scoped to PPCS users
 */

export const ppcsPaths = {
  search: 'ppcs-search',
  searchResults: 'ppcs-search-results',
  noSearchResults: 'no-ppcs-search-results',

  // determinate
  selectIndexOffence: 'select-index-offence',
  consecutiveSentenceDetails: 'consecutive-sentence-details',
  matchIndexOffence: 'match-index-offence',
  determinatePpudSentences: 'determinate-ppud-sentences',
  editCustodyType: 'custody-type',

  // TODO change to select-determinate-ppud-sentence
  selectPpudSentence: 'select-ppud-sentence',
  sentenceToCommitExistingOffender: 'sentence-to-commit-existing-offender',

  // indeterminate
  selectIndeterminatePpudSentence: 'select-indeterminate-ppud-sentence',
  sentenceToCommitIndeterminate: 'sentence-to-commit-indeterminate',
  indeterminateEdit: {
    releaseDate: 'edit-release-date',
    dateOfSentence: 'edit-date-of-sentence',
    offenceDescription: 'edit-offence',
    sentencingCourt: 'edit-sentencing-court',
  },
}

const defaultPpcsMiddleware = [checkRole(HMPPS_AUTH_ROLE.PPCS)]

export const ppcsRoutes: RouteDefinition[] = [
  {
    path: `/${ppcsPaths.search}`,
    method: 'get',
    handler: ppcsSearchController.get,
    additionalMiddleware: defaultPpcsMiddleware,
  },
  {
    path: `/${ppcsPaths.searchResults}`,
    method: 'get',
    handler: ppcsSearchResultsController.get,
    additionalMiddleware: defaultPpcsMiddleware,
  },
  {
    path: `/${ppcsPaths.noSearchResults}`,
    method: 'get',
    handler: noPpcsSearchResultsController.get,
    additionalMiddleware: defaultPpcsMiddleware,
  },
]
