import { NextFunction, Request, Response } from 'express'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'
import { routeUrls } from '../../routes/routeUrls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import logger from '../../../logger'
import { renderErrorMessages, saveErrorWithDetails } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { booleanToYesNo } from '../../utils/utils'
import { validateIsIndeterminateSentence } from '../recommendations/isIndeterminateSentence/formValidator'
import { renderFormOptions } from '../recommendations/formOptions/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const { flags, recommendation } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    backLink: flags.flagTriggerWork ? 'task-list-consider-recall' : 'manager-review',
    page: {
      id: 'isIndeterminateSentence',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.isIndeterminateSentence ? '' : booleanToYesNo(recommendation.isIndeterminateSentence),
    },
    errors: renderErrorMessages(res.locals.errors, stringRenderParams),
    formOptions: renderFormOptions(stringRenderParams),
  }

  res.render(`pages/recommendations/isIndeterminateSentence`)
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

    const { errors, valuesToSave, unsavedValues } = await validateIsIndeterminateSentence({
      requestBody: req.body,
      recommendationId,
      urlInfo,
      token,
    })

    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/is-indeterminate`)
    }

    await updateRecommendation({
      recommendationId,
      valuesToSave,
      token,
      featureFlags: flags,
    })

    res.redirect(303, nextPageLinkUrl({ nextPageId: 'is-extended', urlInfo }))
  } catch (err) {
    if (err.name === 'AppError') {
      throw err
    }
    logger.error(err)
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/is-indeterminant`)
  }
}

export default { get, post }
