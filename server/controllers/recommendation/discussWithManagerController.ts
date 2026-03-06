import { NextFunction, Request, Response } from 'express'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  let nextPageId = 'suitability-for-fixed-term-recall'

  const isIndeterminateSentence =
    (res.locals.flags.flagFTR56Enabled && recommendation.sentenceGroup === SentenceGroup.INDETERMINATE) ||
    (!res.locals.flags.flagFTR56Enabled && recommendation.isIndeterminateSentence)
  const isExtendedSentence =
    (res.locals.flags.flagFTR56Enabled && recommendation.sentenceGroup === SentenceGroup.EXTENDED) ||
    (!res.locals.flags.flagFTR56Enabled && recommendation.isExtendedSentence)

  if (isIndeterminateSentence) {
    nextPageId = 'recall-type-indeterminate'
  } else if (isExtendedSentence) {
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
