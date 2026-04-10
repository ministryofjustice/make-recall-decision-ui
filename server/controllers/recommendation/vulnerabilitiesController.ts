import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import inputDisplayValuesVulnerabilities from '../recommendations/vulnerabilities/inputDisplayValues'
import validateVulnerabilities from '../recommendations/vulnerabilities/formValidator'
import { vulnerabilities, VULNERABILITY } from '../recommendations/vulnerabilities/formOptions'
import { ValueWithDetails, VulnerabilitiesRecommendation } from '../../@types/make-recall-decision-api'
import ppPaths from '../../routes/paths/pp'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals
  res.locals = {
    ...res.locals,
    page: {
      id: 'vulnerabilities',
    },
  }

  const inputDisplayValues = inputDisplayValuesVulnerabilities({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })
  res.locals.inputDisplayValues = inputDisplayValues

  res.locals.exclusive = vulnerabilities.find(v => v.behaviour === 'exclusive')
  res.locals.nonExclusive = vulnerabilities.filter(item => item.behaviour !== 'exclusive')
  res.locals.exclusiveSelected = Array.isArray(inputDisplayValues)
    ? inputDisplayValues.filter(vuln => vuln.value === 'NOT_KNOWN' || vuln.value === 'NONE').length > 0
    : false

  res.locals.fullName = recommendation.personOnProbation?.name

  res.render(`pages/recommendations/${ppPaths.vulnerabilities}`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
    recommendation,
  } = res.locals

  const { vulnerabilities: existingVulnerabilities } = recommendation

  let requestBody = req.body

  requestBody = {
    ...req.body,
    ...(existingVulnerabilities &&
      existingVulnerabilities.selected.reduce((acc: Record<string, string>, val: ValueWithDetails) => {
        acc[`vulnerabilitiesDetails-${val.value}`] = val.details
        return acc
      }, {})),
  }

  const { errors, valuesToSave, unsavedValues } = await validateVulnerabilities({
    requestBody,
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

  const valuesToSaveVulnerabilities: VulnerabilitiesRecommendation = valuesToSave.vulnerabilities

  let nextPageId = 'task-list#heading-vulnerability'

  const vulnerabilitiesAreSelected = valuesToSaveVulnerabilities.selected.filter(
    vulnerability =>
      ![VULNERABILITY.NONE_OR_NOT_KNOWN, VULNERABILITY.NOT_KNOWN, VULNERABILITY.NONE].includes(
        vulnerability.value as VULNERABILITY,
      ),
  )

  if (vulnerabilitiesAreSelected.length) {
    nextPageId = ppPaths.vulnerabilitiesDetails
  }

  return res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
