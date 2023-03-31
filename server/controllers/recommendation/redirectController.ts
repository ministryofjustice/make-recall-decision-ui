import { NextFunction, Request, Response } from 'express'
import { isDefined } from '../../utils/utils'

function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    flags: { flagTriggerWork },
    urlInfo: { basePath },
  } = res.locals

  let nextPageId
  const recallType = recommendation?.recallType?.selected?.value

  if (!isDefined(recallType)) {
    if (flagTriggerWork) {
      nextPageId = 'task-list-consider-recall'
    } else {
      nextPageId = 'response-to-probation'
    }
  } else if (recallType === 'NO_RECALL') {
    nextPageId = 'task-list-no-recall'
  } else {
    nextPageId = 'task-list'
  }

  res.redirect(301, `${basePath}${nextPageId}`)
  next()
}

export default { get }
