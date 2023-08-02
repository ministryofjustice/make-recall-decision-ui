import { NextFunction, Request, Response } from 'express'
import { strings } from '../../textStrings/en'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isMandatoryTextValue } from '../../utils/utils'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'responseToProbation',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.responseToProbation ? '' : recommendation.responseToProbation,
    },
  }

  res.render(`pages/recommendations/responseToProbation`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { responseToProbation } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  if (!isMandatoryTextValue(responseToProbation)) {
    const errorId = 'missingResponseToProbation'
    errors.push(
      makeErrorObject({
        id: 'responseToProbation',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }
  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      responseToProbation,
    },
    token,
    featureFlags: flags,
  })
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-consider-recall', urlInfo }))
}

export default { get, post }
