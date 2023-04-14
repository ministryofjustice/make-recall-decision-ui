import { NextFunction, Request, Response } from 'express'
import { isDefined } from '../../utils/utils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    flags: { flagTriggerWork },
    urlInfo: { basePath },
    user: { token, roles },
  } = res.locals

  const statuses = await getStatuses({
    recommendationId,
    token,
  })

  const isSpoConsiderRecall = statuses
    .filter(status => status.active)
    .find(status => status.name === 'SPO_CONSIDER_RECALL')

  if (isSpoConsiderRecall) {
    await updateStatuses({
      recommendationId,
      token,
      activate: ['SPO_CONSIDERING_RECALL'],
      deActivate: ['SPO_CONSIDER_RECALL'],
    })
  }

  const isSpo = roles.includes('ROLE_MAKE_RECALL_DECISION_SPO')
  let nextPageId
  const recallType = recommendation?.recallType?.selected?.value
  if (isSpo) {
    nextPageId = 'spo-task-list-consider-recall'
  } else if (!isDefined(recallType)) {
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
