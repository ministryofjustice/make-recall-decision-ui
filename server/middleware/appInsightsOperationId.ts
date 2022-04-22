import * as Sentry from '@sentry/node'
import { NextFunction, Request, Response } from 'express'
import { getCorrelationContext } from 'applicationinsights'
import { buildAppInsightsClient } from '../monitoring/azureAppInsights'

export const appInsightsOperationId = (req: Request, res: Response, next: NextFunction) => {
  const appInsightsClient = buildAppInsightsClient()
  res.locals.appInsightsOperationId = appInsightsClient ? getCorrelationContext().operation.id : undefined
  Sentry.setContext('appInsightsOperationId', { appInsightsOperationId: res.locals.appInsightsOperationId })
  next()
}
