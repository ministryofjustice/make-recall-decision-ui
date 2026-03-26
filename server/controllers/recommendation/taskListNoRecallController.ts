import { NextFunction, Request, Response } from 'express'
import { isDefined } from '../../utils/utils'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { taskCompleteness } from '../recommendations/helpers/taskCompleteness'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, urlInfo, flags: featureFlags } = res.locals

  const recallType = recommendation?.recallType?.selected?.value

  if (recallType === undefined) {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'response-to-probation', urlInfo }))
  }

  if (recallType !== 'NO_RECALL') {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list', urlInfo }))
  }

  const recallTypeNotSet = !isDefined(recommendation?.recallType?.selected?.value)
  if (recallTypeNotSet) {
    res.redirect(303, nextPageLinkUrl({ nextPageId: 'response-to-probation', urlInfo }))
    return null
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'taskListNoRecall',
    },
    recommendation,
    ftr56Enabled: featureFlags.flagFTR56Enabled,
    recallType,
  }

  const isIndeterminate = featureFlags.flagFTR56Enabled
    ? recommendation.sentenceGroup === SentenceGroup.INDETERMINATE
    : recommendation.isIndeterminateSentence

  const isExtended = featureFlags.flagFTR56Enabled
    ? recommendation.sentenceGroup === SentenceGroup.EXTENDED
    : recommendation.isExtendedSentence

  if (isIndeterminate) {
    res.locals.whatDoYouRecommendPageUrlSlug = 'recall-type-indeterminate'
  } else if (isExtended) {
    res.locals.whatDoYouRecommendPageUrlSlug = 'recall-type-extended'
  } else {
    res.locals.whatDoYouRecommendPageUrlSlug = 'recall-type'
  }

  res.locals.taskCompleteness = taskCompleteness(recommendation, featureFlags)

  res.render(`pages/recommendations/taskListNoRecall`)
  return next()
}

export default { get }
