import { NextFunction, Request, Response } from 'express'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isMandatoryTextValue } from '../../utils/utils'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, statuses } = res.locals

  const actives = (statuses as RecommendationStatusResponse[]).filter(el => el.active)

  const recallDecided =
    !!actives.find(el => el.name === STATUSES.SPO_SIGNATURE_REQUESTED) ||
    !!actives.find(el => el.name === STATUSES.SPO_SIGNED)
  res.locals = {
    ...res.locals,
    page: {
      id: recallDecided ? 'spoRecallRationaleRecallDecided' : 'spoRecallRationale',
    },
    recallDecided,
    inputDisplayValues: {
      errors: res.locals.errors,
      spoRecallType: res.locals.unsavedValues?.spoRecallType
        ? res.locals.unsavedValues?.spoRecallType
        : recommendation.spoRecallType,
      spoRecallRationale:
        res.locals.errors?.spoRecallRationale || recommendation.spoRecallType !== 'RECALL'
          ? ''
          : recommendation.spoRecallRationale,
    },
  }

  res.render(`pages/recommendations/spoRecallRationale`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { spoRecallType, spoRecallRationale } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(spoRecallType)) {
    const errorId = 'noSpoRecallTypeSelected'
    errors.push(
      makeErrorObject({
        id: 'spoRecallType',
        text: strings.errors[errorId],
        errorId,
      })
    )
  } else if (spoRecallType === 'RECALL' && !isMandatoryTextValue(spoRecallRationale)) {
    const errorId = 'missingSpoRecallRationale'
    errors.push(
      makeErrorObject({
        id: 'spoRecallRationale',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      spoRecallType,
      spoRecallRationale,
    }
    return res.redirect(303, req.originalUrl)
  }

  const valuesToSave: Record<string, unknown> = {
    spoRecallType,
  }

  if (spoRecallType === 'RECALL') {
    valuesToSave.spoRecallRationale = spoRecallRationale
    valuesToSave.explainTheDecision = true
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  if (spoRecallType === 'RECALL') {
    res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-task-list-consider-recall', urlInfo }))
  } else {
    res.redirect(303, `${urlInfo.basePath}spo-why-no-recall`)
  }
}

export default { get, post }
