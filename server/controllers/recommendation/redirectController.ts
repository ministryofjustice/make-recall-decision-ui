import { NextFunction, Request, Response } from 'express'
import { hasValue, isDefined } from '../../utils/utils'
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

  // if the Out of Hours (Approved Premises) people have recorded a rationale.
  const isAPRationalRecorded = statuses.find(status => status.name === STATUSES.AP_RECORDED_RATIONALE)

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
  } else if (isAPRationalRecorded) {
    // in the case of the OOH people raising a recall, when the PP enters, he should skip the trigger stuff as the decision has already been met.

    if (!hasValue(recommendation.isIndeterminateSentence)) {
      nextPageId = 'is-indeterminate'
    } else if (!hasValue(recommendation.isExtendedSentence)) {
      nextPageId = 'is-extended'
    } else if (!hasValue(recallType)) {
      if (recommendation?.isIndeterminateSentence) {
        nextPageId = 'recall-type-indeterminate'
      } else if (recommendation?.isExtendedSentence) {
        nextPageId = 'recall-type-extended'
      } else {
        nextPageId = 'recall-type'
      }
    } else if (recallType === 'NO_RECALL') {
      nextPageId = 'task-list-no-recall'
    } else {
      nextPageId = 'task-list'
    }
  } else if (!isDefined(recallType)) {
    if (isSpoRecordedRationale) {
      if (recommendation?.isIndeterminateSentence) {
        nextPageId = 'recall-type-indeterminate'
      } else if (recommendation?.isExtendedSentence) {
        nextPageId = 'recall-type-extended'
      } else {
        nextPageId = 'suitability-for-fixed-term-recall'
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
