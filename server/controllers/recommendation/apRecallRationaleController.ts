import { NextFunction, Request, Response } from 'express'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import { isMandatoryTextValue, stripHtmlTags } from '../../utils/utils'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  res.locals = {
    ...res.locals,
    page: {
      id: 'apRecallRationale',
    },
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

  res.render(`pages/recommendations/apRecallRationale`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { spoRecallType, spoRecallRationale, odmName } = req.body

  const {
    flags,
    user: { token },
    //  urlInfo, this will be required in future as AP pages are wired up
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
    if (!isMandatoryTextValue(odmName)) {
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
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  if (spoRecallType === 'RECALL') {
    // res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-task-list-consider-recall', urlInfo }))
  } else {
    // res.redirect(303, `${urlInfo.basePath}spo-why-no-recall`)
  }
}

export default { get, post }
