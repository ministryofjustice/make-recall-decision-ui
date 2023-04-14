import { NextFunction, Request, Response } from 'express'
import { getStatuses, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, user } = res.locals

  const statuses = await getStatuses({
    recommendationId: String(recommendation.id),
    token: user.token,
  })

  const isSpoConsideringRecall = statuses
    .filter(status => status.active)
    .find(status => status.name === 'SPO_CONSIDERING_RECALL')

  res.locals = {
    ...res.locals,
    backLink: 'spo-task-list-consider-recall',
    page: {
      id: 'spoRecordDecision',
    },
    editable: !!isSpoConsideringRecall,
    recallType: recommendation.spoRecallType,
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
    },
    token,
    featureFlags: flags,
  })

  await updateStatuses({
    recommendationId,
    token,
    activate: [],
    deActivate: ['SPO_CONSIDERING_RECALL'],
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-confirmation', urlInfo }))
}

export default { get, post }
