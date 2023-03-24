import { NextFunction, Request, Response } from 'express'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'
import { routeUrls } from '../../routes/routeUrls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { makeErrorObject, renderErrorMessages } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../utils/utils'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    backLink: 'task-list-consider-recall',
    page: {
      id: 'triggerLeadingToRecall',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.triggerLeadingToRecall ? '' : recommendation.triggerLeadingToRecall,
    },
    errors: renderErrorMessages(res.locals.errors, stringRenderParams),
  }

  res.render(`pages/recommendations/triggerLeadingToRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { triggerLeadingToRecall } = req.body

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const errors = []

  const sanitized = isString(triggerLeadingToRecall) ? stripHtmlTags(triggerLeadingToRecall as string) : ''
  if (isEmptyStringOrWhitespace(sanitized)) {
    const errorId = 'missingTriggerLeadingToRecall'
    errors.push(
      makeErrorObject({
        id: 'triggerLeadingToRecall',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }

  if (errors.length > 0) {
    req.session.errors = errors
    return res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/trigger-leading-to-recall`)
  }
  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      triggerLeadingToRecall: sanitized,
    },
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-consider-recall', urlInfo }))
}

export default { get, post }
