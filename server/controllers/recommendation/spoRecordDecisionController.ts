import { NextFunction, Request, Response } from 'express'
import { getStatuses, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, user } = res.locals

  const statuses = await getStatuses({
    recommendationId: String(recommendation.id),
    token: user.token,
  })

  const isSpoConsideringRecall = statuses
    .filter(status => status.active)
    .find(status => status.name === STATUSES.SPO_CONSIDERING_RECALL)

  res.locals = {
    ...res.locals,
    backLink: 'spo-task-list-consider-recall',
    page: {
      id: 'spoRecordDecision',
    },
    editable: !!isSpoConsideringRecall,
    recallType: recommendation.spoRecallType,
    spoRecallRationale: recommendation.spoRecallRationale,
    inputDisplayValues: {
      errors: res.locals.errors,
    },
  }
  res.render(`pages/recommendations/spoRecordDecision`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { sensitive } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      sensitive: !!sensitive,
      sendSpoRationaleToDelius: true,
    },
    token,
    featureFlags: flags,
  })

  const statuses = (
    await getStatuses({
      recommendationId,
      token,
    })
  ).filter(status => status.active)

  const isPPDocumentCreated = statuses.find(status => status.name === STATUSES.PP_DOCUMENT_CREATED)

  const activate = [STATUSES.SPO_RECORDED_RATIONALE]

  if (isPPDocumentCreated) {
    activate.push(STATUSES.CLOSED)
  }

  await updateStatuses({
    recommendationId,
    token,
    activate,
    deActivate: [STATUSES.SPO_CONSIDERING_RECALL],
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-rationale-confirmation', urlInfo }))
}

export default { get, post }
