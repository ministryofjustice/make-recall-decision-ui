import { NextFunction, Request, Response } from 'express'
import { createDocument } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
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
