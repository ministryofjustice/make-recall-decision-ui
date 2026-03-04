import { NextFunction, Request, Response } from 'express'
import ppPaths from '../../routes/paths/pp'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, flags } = res.locals

  let nextPageId = 'suitability-for-fixed-term-recall'

  if (recommendation.isIndeterminateSentence) {
    nextPageId = 'recall-type-indeterminate'
  } else if (recommendation.isExtendedSentence) {
    nextPageId = 'recall-type-extended'
    // @todo - update this once Pablo's branch which sets custodyGroup is in place
  } else if (flags?.flagFTR56Enabled && !recommendation.isIndeterminateSentence && !recommendation.isExtendedSentence) {
    nextPageId = ppPaths.checkMappaInformation
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
