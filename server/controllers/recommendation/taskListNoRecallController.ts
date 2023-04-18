import { NextFunction, Request, Response } from 'express'
import { isDefined } from '../../utils/utils'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { taskCompleteness } from '../recommendations/helpers/taskCompleteness'

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
    return
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'taskListNoRecall',
    },
    recommendation,
  }
  res.locals.taskCompleteness = taskCompleteness(recommendation, featureFlags)

  res.render(`pages/recommendations/taskListNoRecall`)
  next()
}

export default { get }
