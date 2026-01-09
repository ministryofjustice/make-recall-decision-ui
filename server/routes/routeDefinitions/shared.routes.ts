import type { RouteDefinition } from '../standardRouter'
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
import retrieveStatuses from '../../controllers/retrieveStatuses'
import retrieveRecommendation from '../../controllers/retrieveRecommendation'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { and, hasRole, not, or, statusIsActive } from '../../middleware/check'
import { parseRecommendationUrl } from '../../middleware/parseRecommendationUrl'
import { guardAgainstModifyingClosedRecommendation } from '../../middleware/guardAgainstModifyingClosedRecommendation'
import customizeMessages from '../../controllers/customizeMessages'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { recommendationPrefix } from '../recommendations'
import redirectController from '../../controllers/recommendation/redirectController'
import audit from '../../controllers/audit'
import taskListController from '../../controllers/recommendation/taskListController'
import { createRecommendationController } from '../../controllers/recommendations/createRecommendation'
import { createAndDownloadDocument } from '../../controllers/recommendations/createAndDownloadDocument'
import { DOCUMENT_TYPE } from '../../@types/make-recall-decision-api/models/DocumentType'
import { updateRecommendationStatus } from '../../controllers/recommendations/updateRecommendationStatus'
import { sharedPaths, casePaths } from '../paths/shared.paths'

const allEnvsRoutes: RouteDefinition[] = [
  { path: sharedPaths.start, method: 'get', handler: startPage },
  { path: sharedPaths.accessibility, method: 'get', handler: (req, res) => res.render('pages/accessibility') },
  { path: sharedPaths.searchByCRN, method: 'get', handler: personSearchByCRN },
  { path: sharedPaths.searchByName, method: 'get', handler: personSearchByName },
  { path: sharedPaths.searchResultsByCRN, method: 'get', handler: personSearchResults },
  { path: sharedPaths.searchResultsByName, method: 'get', handler: personSearchResultsByName },
  // Case-scoped routes
  { path: casePaths.downloadDocument, method: 'get', handler: downloadDocument },
  { path: casePaths.createRecommendationWarning, method: 'get', handler: getCreateRecommendationWarning },
  { path: casePaths.outOfHoursWarning, method: 'get', handler: outOfHoursWarningController.get },
  { path: casePaths.outOfHoursWarning, method: 'post', handler: outOfHoursWarningController.post },
  { path: casePaths.caseSummary, method: 'get', handler: caseSummaryController.get },
  { path: casePaths.replaceRecommendation, method: 'get', handler: replaceCurrentRecommendationController.get },
  // Recommendation shared routes
  {
    path: `${recommendationPrefix}`,
    method: 'get',
    handler: redirectController.get,
    roles: {
      allow: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO],
    },
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      // recommendationStatusCheck is basically a RequestHandler function
      // which just has access to the recommendation object, so it's fine to
      // mix role checks in here too for now
      recommendationStatusCheck(
        or(
          and(not(hasRole(HMPPS_AUTH_ROLE.SPO)), not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED))),
          and(
            hasRole(HMPPS_AUTH_ROLE.SPO),
            or(not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)), statusIsActive(STATUSES.SPO_CONSIDER_RECALL))
          )
        )
      ),
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
      customizeMessages,
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${sharedPaths.recommendations}`,
    method: 'post',
    handler: createRecommendationController,
  },
  {
    path: `${recommendationPrefix}/${sharedPaths.taskList}`,
    method: 'get',
    handler: taskListController.get,
    roles: {
      allow: [HMPPS_AUTH_ROLE.SPO, HMPPS_AUTH_ROLE.PO],
    },
    additionalMiddleware: [
      retrieveStatuses,
      retrieveRecommendation,
      recommendationStatusCheck(
        and(
          not(statusIsActive(STATUSES.PP_DOCUMENT_CREATED)),
          or(
            not(hasRole(HMPPS_AUTH_ROLE.SPO)),
            and(
              hasRole(HMPPS_AUTH_ROLE.SPO),
              or(
                statusIsActive(STATUSES.SPO_SIGNATURE_REQUESTED),
                statusIsActive(STATUSES.SPO_SIGNED),
                statusIsActive(STATUSES.ACO_SIGNATURE_REQUESTED),
                statusIsActive(STATUSES.ACO_SIGNED)
              )
            )
          )
        )
      ),
      parseRecommendationUrl,
      guardAgainstModifyingClosedRecommendation,
      customizeMessages,
    ],
    afterMiddleware: [audit],
  },
  {
    path: `${recommendationPrefix}/${sharedPaths.downloadPartA}`,
    method: 'get',
    handler: createAndDownloadDocument(DOCUMENT_TYPE.PART_A),
  },
  {
    path: `${recommendationPrefix}/${sharedPaths.downloadPreviewPartA}`,
    method: 'get',
    handler: createAndDownloadDocument(DOCUMENT_TYPE.PREVIEW_PART_A),
  },
  {
    path: `${recommendationPrefix}/${sharedPaths.downloadNoRecallLetter}`,
    method: 'get',
    handler: createAndDownloadDocument(DOCUMENT_TYPE.NO_RECALL_LETTER),
  },
  {
    path: `${recommendationPrefix}/${sharedPaths.recommendationStatus}`,
    method: 'post',
    handler: updateRecommendationStatus,
  },
]

const devOnlyRoutes: RouteDefinition[] = [
  {
    path: sharedPaths.flags,
    method: 'get',
    handler: getFeatureFlags,
  },
]

export const sharedRoutes: RouteDefinition[] = [
  ...allEnvsRoutes,
  ...(!isPreprodOrProd(process.env.ENVIRONMENT) ? devOnlyRoutes : []),
]
