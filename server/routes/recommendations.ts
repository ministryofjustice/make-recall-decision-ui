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

const recommendations = Router()

routeRecommendationGet('task-list-consider-recall', taskListConsiderRecallController.get)

routeRecommendationGet('trigger-leading-to-recall', triggerLeadingToRecallController.get)
routeRecommendationPost('trigger-leading-to-recall', triggerLeadingToRecallController.post)

routeRecommendationGet('response-to-probation', responseToProbationController.get)
routeRecommendationPost('response-to-probation', responseToProbationController.post)

routeRecommendationGet('licence-conditions', licenceConditionsController.get)
routeRecommendationPost('licence-conditions', licenceConditionsController.post)

routeRecommendationGet('alternatives-tried', alternativesToRecallTriedController.get)
routeRecommendationPost('alternatives-tried', alternativesToRecallTriedController.post)

routeRecommendationGet('indeterminate-type', indeterminateTypeController.get)
routeRecommendationPost('indeterminate-type', indeterminateTypeController.post)

routeRecommendationGet('is-indeterminate', isIndeterminateController.get)
routeRecommendationPost('is-indeterminate', isIndeterminateController.post)

routeRecommendationGet('is-extended', isExtendedController.get)
routeRecommendationPost('is-extended', isExtendedController.post)

routeRecommendationGet('share-case-with-manager', shareManagerController.get)

routeRecommendationGet('discuss-with-manager', discussWithManagerController.get)

routeRecommendationGet('recall-type', recallTypeController.get)
routeRecommendationPost('recall-type', recallTypeController.post)

routeRecommendationGet('recall-type-indeterminate', recallTypeIndeterminateController.get)
routeRecommendationPost('recall-type-indeterminate', recallTypeIndeterminateController.post)

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

function routeRecommendationGet(endpoint: string, routerCallback: RouterCallback) {
  recommendations.get(
    `/:recommendationId/${endpoint}`,
    sanitizeInputValues,
    parseRecommendationUrl,
    feedErrorsToExpress(retrieve), // necessary for async functions
    customizeMessages,
    feedErrorsToExpress(routerCallback), // necessary for async functions
    audit,
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
      next(error) // forward errors to root router
    }
  )
}

function routeRecommendationPost(endpoint: string, routerCallback: RouterCallback) {
  recommendations.post(
    `/:recommendationId/${endpoint}`,
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
