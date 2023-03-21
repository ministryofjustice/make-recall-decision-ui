import { NextFunction, Request, Response } from 'express'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'
import { routeUrls } from '../../routes/routeUrls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import logger from '../../../logger'
import { makeErrorObject, renderErrorMessages, saveErrorWithDetails } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../utils/utils'

function get(req: Request, res: Response, next: NextFunction) {
  const { flags, recommendation } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    backLink: flags.flagTriggerWork ? 'task-list-consider-recall' : `/cases/${recommendation.crn}/overview`,
    page: {
      id: 'responseToProbation',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.responseToProbation ? '' : recommendation.responseToProbation,
    },
    errors: renderErrorMessages(res.locals.errors, stringRenderParams),
  }

  res.render(`pages/recommendations/responseToProbation`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { responseToProbation } = req.body
  try {
    const {
      flags,
      user: { token },
      urlInfo,
    } = res.locals

    const errors = []

    const sanitized = isString(responseToProbation) ? stripHtmlTags(responseToProbation as string) : ''
    if (isEmptyStringOrWhitespace(sanitized)) {
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
      return res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/response-to-probation`)
    }
    await updateRecommendation({
      recommendationId,
      valuesToSave: {
        responseToProbation: sanitized,
      },
      token,
      featureFlags: flags,
    })

    const nextPageId = flags.flagTriggerWork ? 'task-list-consider-recall' : 'licence-conditions'
    res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
  } catch (err) {
    if (err.name === 'AppError') {
      throw err
    }
    logger.error(err)
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/response-to-probation`)
  }
}

export default { get, post }
