import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import inputDisplayValuesEmergencyRecall from '../recommendations/emergencyRecall/inputDisplayValues'
import validateEmergencyRecall from '../recommendations/emergencyRecall/formValidator'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import EVENTS from '../../utils/constants'
import { SentenceGroup } from '../recommendations/sentenceInformation/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'emergencyRecall',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesEmergencyRecall({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  if (res.locals.flags.flagFTR56Enabled) {
    res.locals.isExtendedSentence = recommendation.sentenceGroup === SentenceGroup.EXTENDED
  } else {
    res.locals.isExtendedSentence = recommendation.isExtendedSentence
  }

  res.render(`pages/recommendations/emergencyRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token, username, region },
    urlInfo,
  } = res.locals

  const { recallType, crn, isExtendedSentence } = req.body
  const { errors, valuesToSave, unsavedValues } = await validateEmergencyRecall({
    requestBody: req.body,
    recommendationId,
    urlInfo,
    token,
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

  if (recallType === 'FIXED_TERM') {
    nextPageId = 'fixed-licence'
  }

  if (!flags.flagFTR56Enabled && recallType === 'STANDARD' && isExtendedSentence === 'true') {
    nextPageId = 'indeterminate-details'
  }

  if (valuesToSave.isThisAnEmergencyRecall) {
    appInsightsEvent(
      EVENTS.MRD_RECALL_TYPE,
      username,
      {
        recallType: 'EMERGENCY_DETERMINATE',
        crn,
        recommendationId,
        region,
      },
      flags,
    )
  }

  const nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
