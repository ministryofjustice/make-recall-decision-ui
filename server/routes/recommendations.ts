/* eslint-disable prettier/prettier */
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
import retrieveRecommendation from '../controllers/retrieveRecommendation'
import responseToProbationController from '../controllers/recommendation/responseToProbationController'
import licenceConditionsController from '../controllers/recommendation/licenceConditionsController'
import alternativesToRecallTriedController from '../controllers/recommendation/alternativesToRecallTriedController'

const recommendations = Router()

recommendations.get(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl)
recommendations.post(`/:recommendationId/:pageUrlSlug`, parseRecommendationUrl)

recommendations.get(
  '/:recommendationId/task-list-consider-recall',
  retrieveRecommendation,
  taskListConsiderRecall.get,
  audit
)

recommendations.get(
  '/:recommendationId/response-to-probation',
  retrieveRecommendation,
  responseToProbationController.get,
  audit
)
recommendations.post('/:recommendationId/response-to-probation', responseToProbationController.post)

recommendations.get(
  '/:recommendationId/licence-conditions',
  retrieveRecommendation,
  licenceConditionsController.get,
  audit
)
recommendations.post('/:recommendationId/licence-conditions', licenceConditionsController.post)

recommendations.get(
  '/:recommendationId/alternatives-tried',
  retrieveRecommendation,
  alternativesToRecallTriedController.get,
  audit
)
recommendations.post('/:recommendationId/alternatives-tried', alternativesToRecallTriedController.post)

const get = (path: string, handler: RequestHandler) => recommendations.get(path, asyncMiddleware(handler))
const post = (path: string, handler: RequestHandler) => recommendations.post(path, asyncMiddleware(handler))
post('', createRecommendationController)
get(`/:recommendationId/documents/part-a`, createAndDownloadDocument('PART_A'))
get(`/:recommendationId/documents/no-recall-letter`, createAndDownloadDocument('NO_RECALL_LETTER'))
post(`/:recommendationId/status`, updateRecommendationStatus)

recommendations.get(`/:recommendationId/:pageUrlSlug`, asyncMiddleware(getRecommendationPage))
recommendations.post(`/:recommendationId/:pageUrlSlug`, asyncMiddleware(postRecommendationForm))

export default recommendations
