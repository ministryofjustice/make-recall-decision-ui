import { NextFunction, Request, Response } from 'express'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import { isMandatoryTextValue, stripHtmlTags } from '../../utils/utils'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  let spoRecallType
  let spoRecallRationale
  let odmName
  if (res.locals.errors) {
    spoRecallType = res.locals.unsavedValues.spoRecallType
    spoRecallRationale = res.locals.unsavedValues.spoRecallRationale
    odmName = res.locals.unsavedValues.odmName
  } else {
    spoRecallType = recommendation.spoRecallType
    spoRecallRationale = recommendation.spoRecallRationale
    odmName = recommendation.odmName
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'apRecallRationale',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      spoRecallType,
      spoRecallRationale,
      odmName,
    },
  }

  res.render(`pages/recommendations/apRecallRationale`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { spoRecallType, spoRecallRationale, odmName } = req.body

  const {
    flags,
    user: { token, hasOdmRole },
    urlInfo,
  } = res.locals

  const errors = []
  let nextPage

  if (!isMandatoryTextValue(spoRecallType)) {
    const errorId = 'noSpoRecallTypeSelected'
    errors.push(
      makeErrorObject({
        id: 'spoRecallType',
        text: strings.errors[errorId],
        errorId,
      })
    )
  } else if (spoRecallType === 'RECALL') {
    if (!isMandatoryTextValue(spoRecallRationale)) {
      const errorId = 'missingSpoRecallRationale'
      errors.push(
        makeErrorObject({
          id: 'spoRecallRationale',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }

    if (!isMandatoryTextValue(odmName) && !hasOdmRole) {
      const errorId = 'missingOdmName'
      errors.push(
        makeErrorObject({
          id: 'odmName',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
  }

  if (errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = {
      spoRecallType,
      spoRecallRationale,
      odmName,
    }
    return res.redirect(303, req.originalUrl)
  }

  const valuesToSave: Record<string, unknown> = {
    spoRecallType,
  }

  if (spoRecallType === 'RECALL') {
    // strip html tags on this value as it is written to delius and its just possible that they are not hardened to XSS.
    valuesToSave.spoRecallRationale = stripHtmlTags(spoRecallRationale)
    valuesToSave.explainTheDecision = true
    valuesToSave.odmName = stripHtmlTags(odmName)
    nextPage = { nextPageId: 'ap-record-decision', urlInfo }
  } else {
    nextPage = { nextPageId: 'ap-why-no-recall', urlInfo }
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl(nextPage))
}

export default { get, post }
