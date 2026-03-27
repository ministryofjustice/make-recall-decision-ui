import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import inputDisplayValuesIndeterminateDetails from '../recommendations/indeterminateOrExtendedSentenceDetails/inputDisplayValues'
import validateIndeterminateDetails from '../recommendations/indeterminateOrExtendedSentenceDetails/formValidator'
import {
  indeterminateOrExtendedSentenceDetails,
  indeterminateOrExtendedSentenceDetailsFtr56,
} from '../recommendations/indeterminateOrExtendedSentenceDetails/formOptions'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'indeterminateOrExtendedSentenceDetails',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesIndeterminateDetails({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.locals.fullName = recommendation.personOnProbation?.name

  res.locals.indeterminateOrExtendedSentenceDetails = res.locals.flags.flagFTR56Enabled
    ? indeterminateOrExtendedSentenceDetailsFtr56
    : indeterminateOrExtendedSentenceDetails

  res.render(`pages/recommendations/indeterminateOrExtendedSentenceDetails`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateIndeterminateDetails({
    requestBody: req.body,
    recommendationId,
    urlInfo,
    token,
    ftr56Enabled: flags.flagFTR56Enabled,
  })

  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  let nextPageId = 'sensitive-info'

  if (flags.flagFTR56Enabled && recommendation.sentenceGroup === SentenceGroup.EXTENDED) {
    nextPageId = 'emergency-recall'
  }

  const nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
