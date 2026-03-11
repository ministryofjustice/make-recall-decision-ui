import { NextFunction, Request, Response } from 'express'
import ppPaths from '../../routes/paths/pp'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, flags } = res.locals

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
  } else if (flags?.flagFTR56Enabled && recommendation.sentenceGroup === SentenceGroup.ADULT_SDS) {
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
