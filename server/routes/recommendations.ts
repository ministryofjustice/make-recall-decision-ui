import { RequestHandler, Router } from 'express'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import taskListConsiderRecall from '../controllers/recommendation/taskListConsiderRecallController'
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

const recommendations = Router()

recommendations.get(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl)
recommendations.post(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl)

recommendations.get('/:recommendationId/task-list-consider-recall', retrieve, taskListConsiderRecall.get, audit)

recommendations.get(
  '/:recommendationId/trigger-leading-to-recall',
  retrieve,
  triggerLeadingToRecallController.get,
  audit
)
recommendations.post('/:recommendationId/trigger-leading-to-recall', triggerLeadingToRecallController.post)

recommendations.get('/:recommendationId/response-to-probation', retrieve, responseToProbationController.get, audit)
recommendations.post('/:recommendationId/response-to-probation', responseToProbationController.post)

recommendations.get('/:recommendationId/licence-conditions', retrieve, licenceConditionsController.get, audit)
recommendations.post('/:recommendationId/licence-conditions', licenceConditionsController.post)

recommendations.get('/:recommendationId/alternatives-tried', retrieve, alternativesToRecallTriedController.get, audit)
recommendations.post('/:recommendationId/alternatives-tried', alternativesToRecallTriedController.post)

recommendations.get('/:recommendationId/is-indeterminate', retrieve, isIndeterminateController.get, audit)
recommendations.post('/:recommendationId/is-indeterminate', isIndeterminateController.post)

recommendations.get('/:recommendationId/is-extended', retrieve, isExtendedController.get, audit)
recommendations.post('/:recommendationId/is-extended', isExtendedController.post)

const get = (path: string, handler: RequestHandler) => recommendations.get(path, asyncMiddleware(handler))
const post = (path: string, handler: RequestHandler) => recommendations.post(path, asyncMiddleware(handler))
post('', createRecommendationController)
get(`/:recommendationId/documents/part-a`, createAndDownloadDocument('PART_A'))
get(`/:recommendationId/documents/no-recall-letter`, createAndDownloadDocument('NO_RECALL_LETTER'))
post(`/:recommendationId/status`, updateRecommendationStatus)

recommendations.get(`/:recommendationId/:pageUrlSlug`, asyncMiddleware(getRecommendationPage))
recommendations.post(`/:recommendationId/:pageUrlSlug`, asyncMiddleware(postRecommendationForm))

export default recommendations
