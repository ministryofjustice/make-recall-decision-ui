import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { taskCompleteness } from '../recommendations/helpers/taskCompleteness'
import { isInCustody } from '../recommendations/helpers/isInCustody'
import { getStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    urlInfo,
    flags: featureFlags,
    user: { token },
  } = res.locals

  const recallType = recommendation?.recallType?.selected?.value

  if (recallType === 'NO_RECALL') {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-no-recall', urlInfo }))
  }

  if (recallType === undefined) {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'response-to-probation', urlInfo }))
  }

  const completeness = taskCompleteness(recommendation, featureFlags)

  let lineManagerCountersignLink = false
  let seniorManagerCountersignLink = false
  let lineManagerCountersignLabel = 'Cannot start yet'
  let seniorManagerCountersignLabel = 'Cannot start yet'
  let lineManagerCountersignStyle = 'grey'
  let seniorManagerCountersignStyle = 'grey'

  if (completeness.areAllComplete && featureFlags.flagTriggerWork) {
    completeness.areAllComplete = false
    const statuses = (
      await getStatuses({
        recommendationId,
        token,
      })
    ).filter(status => status.active)

    const isSpoSignatureRequested = statuses.find(status => status.name === STATUSES.SPO_SIGNATURE_REQUESTED)
    const isSpoSigned = statuses.find(status => status.name === STATUSES.SPO_SIGNED)
    const isAcoSignatureRequested = statuses.find(status => status.name === STATUSES.ACO_SIGNATURE_REQUESTED)
    const isAcoSigned = statuses.find(status => status.name === STATUSES.ACO_SIGNED)

    if (isAcoSigned) {
      lineManagerCountersignStyle = 'blue'
      lineManagerCountersignLabel = 'Completed'
      lineManagerCountersignLink = true

      seniorManagerCountersignStyle = 'blue'
      seniorManagerCountersignLabel = 'Completed'
      seniorManagerCountersignLink = true
      completeness.areAllComplete = true
    } else if (isAcoSignatureRequested) {
      lineManagerCountersignStyle = 'blue'
      lineManagerCountersignLabel = 'Completed'
      lineManagerCountersignLink = true

      seniorManagerCountersignLabel = 'Requested'
      seniorManagerCountersignLink = true
    } else if (isSpoSigned) {
      lineManagerCountersignStyle = 'blue'
      lineManagerCountersignLabel = 'Completed'
      lineManagerCountersignLink = true

      seniorManagerCountersignLabel = 'To do'
      seniorManagerCountersignLink = true
    } else if (isSpoSignatureRequested) {
      lineManagerCountersignLabel = 'Requested'
      lineManagerCountersignLink = true
    } else {
      lineManagerCountersignLabel = 'To do'
      lineManagerCountersignLink = true
    }
  }

  recommendation.isInCustody = isInCustody(recommendation.custodyStatus?.selected)
  res.locals = {
    ...res.locals,
    page: {
      id: 'taskList',
    },
    recommendation,
    lineManagerCountersignLink,
    seniorManagerCountersignLink,
    lineManagerCountersignLabel,
    seniorManagerCountersignLabel,
    lineManagerCountersignStyle,
    seniorManagerCountersignStyle,
    flagTriggerWork: featureFlags.flagTriggerWork,
    taskCompleteness: completeness,
  }

  res.render(`pages/recommendations/taskList`)
  next()
}

export default { get }
