import * as Sentry from '@sentry/node'
import { NextFunction, Request, Response } from 'express'
import { trace } from '@opentelemetry/api'

const appInsightsOperationId = (req: Request, res: Response, next: NextFunction) => {
  const activeSpan = trace.getActiveSpan()
  res.locals.appInsightsOperationId = activeSpan ? activeSpan.spanContext().traceId : undefined
  Sentry.setContext('appInsightsOperationId', { appInsightsOperationId: res.locals.appInsightsOperationId })
  next()
}

export default appInsightsOperationId
