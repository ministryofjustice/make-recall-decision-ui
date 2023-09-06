import { NextFunction, Request, Response } from 'express'
import { createDocument } from '../../data/makeDecisionApiClient'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  const { recommendationId } = req.params
  const {
    recommendation,
    user: { token },
  } = res.locals

  const { letterContent } = await createDocument(recommendationId, 'no-recall-letter', { format: 'preview' }, token)
  res.locals = {
    ...res.locals,
    page: {
      id: 'previewNoRecallLetter',
    },
    recommendation,
    letterContent,
  }

  res.render(`pages/recommendations/previewNoRecallLetter`)
  next()
}

export default { get }
