import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesVulnerabilities } from '../recommendations/vulnerabilities/inputDisplayValues'
import {
  validateVulnerabilities,
  validateVulnerabilitiesRiskToSelf,
} from '../recommendations/vulnerabilities/formValidator'
import { routeUrls } from '../../routes/routeUrls'
import { vulnerabilities, vulnerabilitiesRiskToSelf } from '../recommendations/vulnerabilities/formOptions'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  const pageId = res.locals.flags.flagRiskToSelfEnabled ? 'vulnerabilitiesRiskToSelf' : 'vulnerabilities'
  res.locals = {
    ...res.locals,
    page: {
      id: pageId,
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesVulnerabilities({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  const vulnerabilitiesToUse = res.locals.flags.flagRiskToSelfEnabled ? vulnerabilitiesRiskToSelf : vulnerabilities
  res.locals.exclusive = vulnerabilitiesToUse.find(v => v.behaviour === 'exclusive')
  res.locals.nonExclusive = vulnerabilitiesToUse.filter(item => item.behaviour !== 'exclusive')

  res.locals.fullName = recommendation.personOnProbation?.name

  res.render(`pages/recommendations/vulnerabilities`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const validationToUse = res.locals.flags.flagRiskToSelfEnabled
    ? validateVulnerabilitiesRiskToSelf
    : validateVulnerabilities

  const { errors, valuesToSave, unsavedValues } = await validationToUse({
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
  const nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-vulnerability`
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
