import { NextFunction, Request, Response } from 'express'
import { inputDisplayValuesVulnerabilitiesDetails } from '../recommendations/vulnerabilitiesDetails/inputDisplayValues'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { validateVulnerabilitiesDetails } from '../recommendations/vulnerabilitiesDetails/formValidator'
import { ValueWithDetails } from '../../@types/make-recall-decision-api'
import { vulnerabilitiesToDisplay } from '../recommendations/vulnerabilitiesDetails/vulnerabilitiesToDisplay'
import { sharedPaths } from '../../routes/paths/shared.paths'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation, flags, urlInfo } = res.locals
  const { recommendationId } = req.params

  if (!flags.flagRiskToSelfEnabled) {
    const nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/task-list#heading-vulnerability`
    res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
  } else {
    res.locals = {
      ...res.locals,
      page: {
        id: 'vulnerabilitiesDetails',
      },
      vulnerabilitiesToDisplay: vulnerabilitiesToDisplay(recommendation.vulnerabilities),
    }

    res.locals.inputDisplayValues = inputDisplayValuesVulnerabilitiesDetails({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    })

    res.render(`pages/recommendations/vulnerabilitiesDetails`)
  }

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

  // previously we had the selected vulnerabilities list we could validate against in the post data
  // now it's a separate screen we have to find that data and pass it into the formValidation
  const selectedVulnerabilities =
    recommendation.vulnerabilities?.selected.reduce((acc: string[], vulnerability: ValueWithDetails) => {
      if (vulnerability.value) {
        acc.push(vulnerability.value)
      }
      return acc
    }, []) || []

  const { errors, valuesToSave, unsavedValues } = await validateVulnerabilitiesDetails({
    requestBody: {
      ...req.body,
      selectedVulnerabilities,
    },
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

  const nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/task-list#heading-vulnerability`
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
