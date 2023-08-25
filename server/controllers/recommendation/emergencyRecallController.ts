import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesEmergencyRecall } from '../recommendations/emergencyRecall/inputDisplayValues'
import { validateEmergencyRecall } from '../recommendations/emergencyRecall/formValidator'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

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

  const { recallType, crn } = req.body
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

  const nextPageId = recallType === 'FIXED_TERM' ? 'fixed-licence' : 'sensitive-info'
  const nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })

  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))

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
      flags
    )
  }
}

export default { get, post }
