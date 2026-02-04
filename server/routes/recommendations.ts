import { RequestHandler } from 'express'
import retrieveStatuses from '../controllers/retrieveStatuses'
import retrieveRecommendation from '../controllers/retrieveRecommendation'
import { parseRecommendationUrl } from '../middleware/parseRecommendationUrl'
import { guardAgainstModifyingClosedRecommendation } from '../middleware/guardAgainstModifyingClosedRecommendation'
import customizeMessages from '../controllers/customizeMessages'
import audit from '../controllers/audit'
import { RouteDefinition } from './standardRouter'

export const RECOMMENDATION_PREFIX = '/recommendations/:recommendationId'

function generateDefaultRecommendationGetMiddleware(additionalMiddleware: RequestHandler[]): RequestHandler[] {
  return [
    retrieveStatuses,
    retrieveRecommendation,
    ...additionalMiddleware,
    parseRecommendationUrl,
    guardAgainstModifyingClosedRecommendation,
    customizeMessages,
  ]
}

function generateDefaultRecommendationPostMiddleware(additionalMiddleware: RequestHandler[]): RequestHandler[] {
  return [retrieveStatuses, retrieveRecommendation, ...additionalMiddleware, parseRecommendationUrl]
}

export function createRecommendationRouteTemplate(
  method: RouteDefinition['method'],
  additionalMiddleware: RouteDefinition['additionalMiddleware'],
  roles: RouteDefinition['roles']
): Pick<RouteDefinition, 'method' | 'roles' | 'additionalMiddleware' | 'afterMiddleware'> {
  return {
    method,
    roles,
    /// Only run an audit on get requests
    afterMiddleware: [...(method === 'get' ? [audit] : [])],
    additionalMiddleware: [
      ...(method === 'get'
        ? generateDefaultRecommendationGetMiddleware(additionalMiddleware)
        : generateDefaultRecommendationPostMiddleware(additionalMiddleware)),
    ],
  }
}
