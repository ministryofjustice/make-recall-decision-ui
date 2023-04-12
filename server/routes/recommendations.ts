import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import taskListConsiderRecallController from '../controllers/recommendation/taskListConsiderRecallController'
import { createRecommendationController } from '../controllers/recommendations/createRecommendation'
import { createAndDownloadDocument } from '../controllers/recommendations/createAndDownloadDocument'
import { updateRecommendationStatus } from '../controllers/recommendations/updateRecommendationStatus'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { getRecommendationPage } from '../controllers/recommendations/getRecommendationPage'
import { postRecommendationForm } from '../controllers/recommendations/postRecommendationForm'
import audit from '../controllers/audit'
import retrieve from '../controllers/retrieveRecommendation'
import responseToProbationController from '../controllers/recommendation/responseToProbationController'
import licenceConditionsController from '../controllers/recommendation/licenceConditionsController'
import alternativesToRecallTriedController from '../controllers/recommendation/alternativesToRecallTriedController'
import triggerLeadingToRecallController from '../controllers/recommendation/triggerLeadingToRecallController'
import isIndeterminateController from '../controllers/recommendation/isIndeterminateController'
import isExtendedController from '../controllers/recommendation/isExtendedController'

import indeterminateTypeController from '../controllers/recommendation/indeterminateTypeController'
import customizeMessages from '../controllers/customizeMessages'
import shareManagerController from '../controllers/recommendation/shareManagerController'
import sanitizeInputValues from '../controllers/sanitizeInputValues'
import discussWithManagerController from '../controllers/recommendation/discussWithManagerController'
import recallTypeController from '../controllers/recommendation/recallTypeController'
import recallTypeIndeterminateController from '../controllers/recommendation/recallTypeIndeterminateController'
import redirectController from '../controllers/recommendation/redirectController'
import { guardAgainstModifyingClosedRecommendation } from '../middleware/guardAgainstModifyingClosedRecommendation'
import spoTaskListConsiderRecallController from '../controllers/recommendation/spoTaskListConsiderRecallController'
import authorisationMiddleware, { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'
import reviewPractitionersConcernsController from '../controllers/recommendation/reviewPractitionersConcernsController'
import caseSummaryController from '../controllers/caseSummary/caseSummaryController'
import spoRecallRationaleController from '../controllers/recommendation/spoRecallRationaleController'

const recommendations = Router()

routeRecommendationGet('', redirectController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('spo-task-list-consider-recall', spoTaskListConsiderRecallController.get, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet(`review-case/:crn/:sectionId`, caseSummaryController.get, [HMPPS_AUTH_ROLE.SPO])
routeRecommendationPost(`review-case/:crn/:sectionId`, caseSummaryController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet('review-practitioners-concerns', reviewPractitionersConcernsController.get, [
  HMPPS_AUTH_ROLE.SPO,
])
routeRecommendationPost('review-practitioners-concerns', reviewPractitionersConcernsController.post, [
  HMPPS_AUTH_ROLE.SPO,
])

routeRecommendationGet('spo-rationale', spoRecallRationaleController.get, [HMPPS_AUTH_ROLE.SPO])
routeRecommendationPost('spo-rationale', spoRecallRationaleController.post, [HMPPS_AUTH_ROLE.SPO])

routeRecommendationGet('task-list-consider-recall', taskListConsiderRecallController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('trigger-leading-to-recall', triggerLeadingToRecallController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('trigger-leading-to-recall', triggerLeadingToRecallController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('response-to-probation', responseToProbationController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('response-to-probation', responseToProbationController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('licence-conditions', licenceConditionsController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('licence-conditions', licenceConditionsController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('alternatives-tried', alternativesToRecallTriedController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('alternatives-tried', alternativesToRecallTriedController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('indeterminate-type', indeterminateTypeController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('indeterminate-type', indeterminateTypeController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('is-indeterminate', isIndeterminateController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('is-indeterminate', isIndeterminateController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('is-extended', isExtendedController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('is-extended', isExtendedController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('share-case-with-manager', shareManagerController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('discuss-with-manager', discussWithManagerController.get, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('recall-type', recallTypeController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('recall-type', recallTypeController.post, [HMPPS_AUTH_ROLE.PO])

routeRecommendationGet('recall-type-indeterminate', recallTypeIndeterminateController.get, [HMPPS_AUTH_ROLE.PO])
routeRecommendationPost('recall-type-indeterminate', recallTypeIndeterminateController.post, [HMPPS_AUTH_ROLE.PO])

const get = (path: string, handler: RequestHandler) => recommendations.get(path, asyncMiddleware(handler))
const post = (path: string, handler: RequestHandler) => recommendations.post(path, asyncMiddleware(handler))
post('', createRecommendationController)
get(`/:recommendationId/documents/part-a`, createAndDownloadDocument('PART_A'))
get(`/:recommendationId/documents/no-recall-letter`, createAndDownloadDocument('NO_RECALL_LETTER'))
post(`/:recommendationId/status`, updateRecommendationStatus)

recommendations.get(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl, asyncMiddleware(getRecommendationPage))
recommendations.post(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl, asyncMiddleware(postRecommendationForm))

export default recommendations

type RouterCallback = (req: Request, res: Response, next: NextFunction) => void

function routeRecommendationGet(endpoint: string, routerCallback: RouterCallback, roles: string[]) {
  recommendations.get(
    `/:recommendationId/${endpoint}`,
    feedErrorsToExpress(authorisationMiddleware(roles)),
    sanitizeInputValues,
    parseRecommendationUrl,
    feedErrorsToExpress(retrieve), // necessary for async functions
    guardAgainstModifyingClosedRecommendation,
    customizeMessages,
    feedErrorsToExpress(routerCallback), // necessary for async functions
    audit,
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      next(error) // forward errors to root router
    }
  )
}

function routeRecommendationPost(endpoint: string, routerCallback: RouterCallback, roles: string[]) {
  recommendations.post(
    `/:recommendationId/${endpoint}`,
    authorisationMiddleware(roles),
    sanitizeInputValues,
    parseRecommendationUrl,
    feedErrorsToExpress(routerCallback), // necessary for async functions
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      next(error) // forward errors to root router
    }
  )
}

function feedErrorsToExpress(routerCallback: RouterCallback) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await routerCallback(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
