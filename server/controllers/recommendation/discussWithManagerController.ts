import { NextFunction, Request, Response } from 'express'
import ppPaths from '../../routes/paths/pp'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    flags: { flagFTR56Enabled },
  } = res.locals

  let nextPageId = 'suitability-for-fixed-term-recall'

  const isIndeterminateSentence =
    (flagFTR56Enabled && recommendation.sentenceGroup === SentenceGroup.INDETERMINATE) ||
    (!flagFTR56Enabled && recommendation.isIndeterminateSentence)
  const isExtendedSentence =
    (flagFTR56Enabled && recommendation.sentenceGroup === SentenceGroup.EXTENDED) ||
    (!flagFTR56Enabled && recommendation.isExtendedSentence)

  if (isIndeterminateSentence) {
    nextPageId = flagFTR56Enabled ? 'indeterminate-details' : 'recall-type-indeterminate'
  } else if (isExtendedSentence) {
    nextPageId = flagFTR56Enabled ? 'indeterminate-details' : 'recall-type-extended'
  } else if (recommendation?.sentenceGroup === SentenceGroup.ADULT_SDS) {
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
