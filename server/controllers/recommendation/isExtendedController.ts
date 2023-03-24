import { NextFunction, Request, Response } from 'express'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'
import { routeUrls } from '../../routes/routeUrls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import logger from '../../../logger'
import { renderErrorMessages, saveErrorWithDetails } from '../../utils/errors'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { booleanToYesNo } from '../../utils/utils'

import { renderFormOptions } from '../recommendations/formOptions/formOptions'
import { validateIsExtendedSentence } from '../recommendations/isExtendedSentence/formValidator'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    backLink: 'is-indeterminate',
    page: {
      id: 'isExtendedSentence',
    },
    inputDisplayValues: {
      errors: res.locals.errors,
      value: res.locals.errors?.isExtendedSentence ? '' : booleanToYesNo(recommendation.isExtendedSentence),
    },
    errors: renderErrorMessages(res.locals.errors, stringRenderParams),
    formOptions: renderFormOptions(stringRenderParams),
  }

  res.render(`pages/recommendations/isExtendedSentence`)
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

    const { errors, valuesToSave, unsavedValues } = await validateIsExtendedSentence({
      requestBody: req.body,
      recommendationId,
      urlInfo,
      token,
    })

    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/is-extended`)
    }
    await updateRecommendation({
      recommendationId,
      valuesToSave,
      token,
      featureFlags: flags,
    })

    const isIndeterminateSentence = req.body.isIndeterminateSentence === '1'

    let nextPageId
    if (isIndeterminateSentence) {
      nextPageId = 'indeterminate-type'
    } else if (flags.flagTriggerWork) {
      nextPageId = 'task-list-consider-recall'
    } else {
      nextPageId = valuesToSave.isExtendedSentence ? 'recall-type-indeterminate' : 'recall-type'
    }

    res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
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
