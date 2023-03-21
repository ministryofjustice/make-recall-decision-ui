import { NextFunction, Request, Response } from 'express'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'
import { renderErrorMessages, saveErrorWithDetails } from '../../utils/errors'
import { routeUrls } from '../../routes/routeUrls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import logger from '../../../logger'
import { renderFormOptions } from '../recommendations/formOptions/formOptions'
import { inputDisplayValuesAlternativesToRecallTried } from '../recommendations/alternativesToRecallTried/inputDisplayValues'
import { validateAlternativesTried } from '../recommendations/alternativesToRecallTried/formValidator'

async function get(req: Request, res: Response, next: NextFunction) {
  const { flags, recommendation } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    backLink: flags.flagTriggerWork ? 'task-list-consider-recall' : 'licence-conditions',
    page: {
      id: 'alternativesToRecallTried',
    },
    errors: renderErrorMessages(res.locals.errors, stringRenderParams),
    formOptions: renderFormOptions(stringRenderParams),
  }

  res.locals.inputDisplayValues = inputDisplayValuesAlternativesToRecallTried({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.render(`pages/recommendations/alternativesToRecallTried`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  try {
    const {
      flags,
      user: { token },
      urlInfo,
    } = res.locals

    const { errors, valuesToSave, unsavedValues } = await validateAlternativesTried({
      requestBody: req.body,
      recommendationId,
      urlInfo,
      token,
    })

    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/alternatives-tried`)
    }

    await updateRecommendation({
      recommendationId,
      valuesToSave,
      token,
      featureFlags: flags,
    })

    const nextPageId = flags.flagTriggerWork ? 'task-list-consider-recall' : 'manager-review'
    res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
  } catch (err) {
    if (err.name === 'AppError') {
      throw err
    }
    logger.error(err)
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/alternatives-tried`)
  }
}

export default { get, post }
