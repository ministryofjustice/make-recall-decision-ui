import { NextFunction, Request, Response } from 'express'
import { isDefined } from '../../utils/utils'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { taskCompleteness } from '../recommendations/helpers/taskCompleteness'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'
import ppPaths from '../../routes/paths/pp'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, urlInfo, flags: featureFlags } = res.locals

  const recallType = recommendation?.recallType?.selected?.value

  if (featureFlags.flagFTR56Enabled && (!isDefined(recallType) || recallType !== 'NO_RECALL')) {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: ppPaths.taskListConsiderRecall, urlInfo }))
  }

  if (recallType !== 'NO_RECALL') {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list', urlInfo }))
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

  const isIndeterminate = recommendation.sentenceGroup === SentenceGroup.INDETERMINATE

  const isExtended = recommendation.sentenceGroup === SentenceGroup.EXTENDED

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
