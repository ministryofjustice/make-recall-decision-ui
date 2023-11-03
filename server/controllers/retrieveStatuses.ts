import { NextFunction, Request, Response } from 'express'
import { getStatuses } from '../data/makeDecisionApiClient'

export default async function retrieveStatuses(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
  } = res.locals

  res.locals.statuses = await getStatuses({ recommendationId, token })

  next()
}
