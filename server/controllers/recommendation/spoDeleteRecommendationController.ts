import { NextFunction, Request, Response } from 'express'
import { getStatuses, updateRecommendation } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { strings } from '../../textStrings/en'
import { isMandatoryTextValue, stripHtmlTags } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'

async function get(req: Request, res: Response, next: NextFunction) {
  let id: string
  let bodyText: string
  let buttonText: string
  let headingText: string

  const statuses = (
    await getStatuses({
      recommendationId: String(res.locals.recommendation.id),
      token: res.locals.user.token,
    })
  ).filter(status => status.active)

  const backLink = `/cases/${res.locals.recommendation.crn}/overview`

  const isDoNotRecall = statuses.find(status => status.name === STATUSES.NO_RECALL_DECIDED)
  const isRecallDecided = statuses.find(status => status.name === STATUSES.RECALL_DECIDED)

  if (isDoNotRecall) {
    id = 'cancelDntrRationale'
    headingText = 'decision not to recall'
    bodyText = 'cancel this decision not to recall'
    buttonText = 'Cancel decision not to recall'
  } else if (isRecallDecided) {
    id = 'cancelPartARationale'
    headingText = 'Part A'
    bodyText = 'cancel this Part A'
    buttonText = 'Cancel Part A'
  } else {
    // to capture legacy recommendations and any new ones that have status STATUSES.PO_START_RECALL
    id = 'cancelRecommendationRationale'
    headingText = 'recommendation'
    bodyText = 'cancel this recommendation'
    buttonText = 'Cancel recommendation'
  }

  res.locals = {
    ...res.locals,
    page: {
      id,
      bodyText,
    },
    headingText,
    buttonText,
    backLink,
  }

  res.render(`pages/recommendations/spoDeleteRecommendationRationale`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { spoDeleteRecommendationRationale } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
    statuses,
  } = res.locals

  let errorId: string

  const isDoNotRecall = statuses.find((status: { name: STATUSES }) => status.name === STATUSES.NO_RECALL_DECIDED)
  const isRecallDecided = statuses.find((status: { name: STATUSES }) => status.name === STATUSES.RECALL_DECIDED)

  if (isDoNotRecall) {
    errorId = 'missingCancelDntrRationale'
  } else if (isRecallDecided) {
    errorId = 'missingCancelPartARationale'
  } else {
    // to capture legacy recommendations and any new ones that have status STATUSES.PO_START_RECALL
    errorId = 'missingCancelRecommendationRationale'
  }
  const errors = []

  if (!isMandatoryTextValue(spoDeleteRecommendationRationale)) {
    errors.push(
      makeErrorObject({
        id: 'spoDeleteRecommendationRationale',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }
  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      spoDeleteRecommendationRationale,
    }
    return res.redirect(303, req.originalUrl)
  }
  const valuesToSave: Record<string, string> = {
    spoDeleteRecommendationRationale,
  }

  valuesToSave.spoDeleteRecommendationRationale = stripHtmlTags(spoDeleteRecommendationRationale)

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'record-delete-rationale', urlInfo }))
}

export default { get, post }
