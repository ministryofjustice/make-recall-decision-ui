import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const nextPageId =
    recommendation.isIndeterminateSentence || recommendation.isExtendedSentence
      ? 'recall-type-indeterminate'
      : 'recall-type'

  res.locals = {
    ...res.locals,
    backLink: 'share-case-with-manager',
    page: {
      id: 'discussWithManager',
    },
    nextPageId,
  }

  res.render(`pages/recommendations/discussWithManager`)
  next()
}

export default { get }
