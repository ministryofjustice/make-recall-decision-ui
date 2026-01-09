import { RequestHandler } from 'express'
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'
import recommendationStatusCheck, { STATUSES } from '../middleware/recommendationStatusCheck'
import { and, hasRole, not, or, statusIsActive } from '../middleware/check'
import retrieveStatuses from '../controllers/retrieveStatuses'
import retrieveRecommendation from '../controllers/retrieveRecommendation'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import { guardAgainstModifyingClosedRecommendation } from '../middleware/guardAgainstModifyingClosedRecommendation'
import customizeMessages from '../controllers/customizeMessages'

export const recommendationPrefix = '/recommendations/:recommendationId'

export const defaultRecommendationGetMiddleware: RequestHandler[] = [
  retrieveStatuses,
  retrieveRecommendation,
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
]

export const defaultRecommendationPostMiddleware: RequestHandler[] = [
  retrieveStatuses,
  retrieveRecommendation,
  parseRecommendationUrl,
]
