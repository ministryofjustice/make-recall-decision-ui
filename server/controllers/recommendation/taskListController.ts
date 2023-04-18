import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { taskCompleteness } from '../recommendations/helpers/taskCompleteness'
import { isInCustody } from '../recommendations/helpers/isInCustody'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, urlInfo, flags: featureFlags } = res.locals

  const recallType = recommendation?.recallType?.selected?.value

  if (recallType === 'NO_RECALL') {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-no-recall', urlInfo }))
  }

  if (recallType === undefined) {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'response-to-probation', urlInfo }))
  }

  recommendation.isInCustody = isInCustody(recommendation.custodyStatus?.selected)
  res.locals = {
    ...res.locals,
    page: {
      id: 'taskList',
    },
    recommendation,
  }

  res.locals.taskCompleteness = taskCompleteness(recommendation, featureFlags)

  res.render(`pages/recommendations/taskList`)
  next()
}

export default { get }
