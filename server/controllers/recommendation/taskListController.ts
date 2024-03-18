import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { taskCompleteness } from '../recommendations/helpers/taskCompleteness'
import { isInCustody } from '../recommendations/helpers/isInCustody'
import { getStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    urlInfo,
    flags: featureFlags,
    user: { token, roles },
  } = res.locals

  const statuses = (
    await getStatuses({
      recommendationId,
      token,
    })
  ).filter(status => status.active)

  const isNoRecallDecided = statuses.find(status => status.name === STATUSES.NO_RECALL_DECIDED)

  if (isNoRecallDecided) {
    return res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-no-recall', urlInfo }))
  }

  const isSpo = roles.includes('ROLE_MAKE_RECALL_DECISION_SPO')
  const isSpoRationaleRecorded =
    !!statuses.find(status => status.name === STATUSES.SPO_RECORDED_RATIONALE) ||
    !!statuses.find(status => status.name === STATUSES.AP_RECORDED_RATIONALE)
  const completeness = taskCompleteness(recommendation, featureFlags)

  let lineManagerCountersignLink = false
  let seniorManagerCountersignLink = false
  let lineManagerCountersignLabel = 'Cannot start yet'
  let seniorManagerCountersignLabel = 'Cannot start yet'
  let lineManagerCountersignStyle = 'grey'
  let seniorManagerCountersignStyle = 'grey'

  let isAcoSigned = false
  if (completeness.isReadyForCounterSignature) {
    const isSpoSignatureRequested = !!statuses.find(status => status.name === STATUSES.SPO_SIGNATURE_REQUESTED)
    const isSpoSigned = !!statuses.find(status => status.name === STATUSES.SPO_SIGNED)
    const isAcoSignatureRequested = !!statuses.find(status => status.name === STATUSES.ACO_SIGNATURE_REQUESTED)
    isAcoSigned = !!statuses.find(status => status.name === STATUSES.ACO_SIGNED)

    if (isAcoSigned) {
      lineManagerCountersignStyle = 'blue'
      lineManagerCountersignLabel = 'Completed'
      lineManagerCountersignLink = false

      seniorManagerCountersignStyle = 'blue'
      seniorManagerCountersignLabel = 'Completed'
      seniorManagerCountersignLink = false
    } else if (isAcoSignatureRequested) {
      lineManagerCountersignStyle = 'blue'
      lineManagerCountersignLabel = 'Completed'
      lineManagerCountersignLink = false

      seniorManagerCountersignLabel = 'Requested'
      seniorManagerCountersignLink = true
    } else if (isSpoSigned) {
      lineManagerCountersignStyle = 'blue'
      lineManagerCountersignLabel = 'Completed'
      lineManagerCountersignLink = false

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
    isSpo,
    isAcoSigned,
    isSpoRationaleRecorded,
    lineManagerCountersignLink,
    seniorManagerCountersignLink,
    lineManagerCountersignLabel,
    seniorManagerCountersignLabel,
    lineManagerCountersignStyle,
    seniorManagerCountersignStyle,
    taskCompleteness: {
      statuses: completeness.statuses,
      isReadyForCounterSignature: completeness.isReadyForCounterSignature,
      areAllComplete: completeness.areAllComplete && isAcoSigned,
    },
    shareLink: `${config.domain}/recommendations/${recommendationId}/task-list`,
    countersignSpoExposition: recommendation.countersignSpoExposition,
  }

  if (recommendation.isIndeterminateSentence) {
    res.locals.whatDoYouRecommendPageUrlSlug = 'recall-type-indeterminate'
  } else if (recommendation.isExtendedSentence) {
    res.locals.whatDoYouRecommendPageUrlSlug = 'recall-type-extended'
  } else {
    res.locals.whatDoYouRecommendPageUrlSlug = 'recall-type'
  }

  res.render(`pages/recommendations/taskList`)
  next()
}

export default { get }
