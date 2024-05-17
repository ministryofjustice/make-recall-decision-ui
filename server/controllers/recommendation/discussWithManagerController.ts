import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  let nextPageId = 'suitability-for-fixed-term-recall'

  if (recommendation.isIndeterminateSentence) {
    nextPageId = 'recall-type-indeterminate'
  } else if (recommendation.isExtendedSentence) {
    nextPageId = 'recall-type-extended'
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'discussWithManager',
    },
    nextPageId,
  }

  res.render(`pages/recommendations/discussWithManager`)
  next()
}

export default { get }
