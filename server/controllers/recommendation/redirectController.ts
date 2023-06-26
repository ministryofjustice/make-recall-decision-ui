import { NextFunction, Request, Response } from 'express'
import { isDefined } from '../../utils/utils'
import { getStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    urlInfo: { basePath },
    user: { token, roles },
  } = res.locals

  const statuses = (
    await getStatuses({
      recommendationId,
      token,
    })
  ).filter(status => status.active)

  const isSpoConsiderRecall = statuses.find(status => status.name === STATUSES.SPO_CONSIDER_RECALL)
  const isSpoRecordedRationale = statuses.find(status => status.name === STATUSES.SPO_RECORDED_RATIONALE)

  const isSpoSignatureRequested = statuses.find(status => status.name === STATUSES.SPO_SIGNATURE_REQUESTED)
  const isAcoSignatureRequested = statuses.find(status => status.name === STATUSES.ACO_SIGNATURE_REQUESTED)

  const isSpo = roles.includes('ROLE_MAKE_RECALL_DECISION_SPO')

  let nextPageId
  const recallType = recommendation?.recallType?.selected?.value

  if (isSpo) {
    if (isSpoConsiderRecall) {
      nextPageId = 'spo-task-list-consider-recall'
    } else if (isSpoSignatureRequested || isAcoSignatureRequested) {
      nextPageId = 'task-list'
    } else {
      nextPageId = 'spo-task-list-consider-recall'
    }
  } else if (!isDefined(recallType)) {
    if (isSpoRecordedRationale) {
      if (recommendation?.isExtendedSentence || recommendation?.isIndeterminateSentence) {
        nextPageId = 'recall-type-indeterminate'
      } else {
        nextPageId = 'recall-type'
      }
    } else {
      nextPageId = 'task-list-consider-recall'
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
