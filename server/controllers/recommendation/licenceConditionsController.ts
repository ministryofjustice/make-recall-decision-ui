import { NextFunction, Request, Response } from 'express'
import { renderStrings } from '../recommendations/helpers/renderStrings'
import { strings } from '../../textStrings/en'
import { renderErrorMessages } from '../../utils/errors'
import { routeUrls } from '../../routes/routeUrls'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesLicenceConditions } from '../recommendations/licenceConditions/inputDisplayValues'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'
import { renderFormOptions } from '../recommendations/formOptions/formOptions'
import { validateLicenceConditionsBreached } from '../recommendations/licenceConditions/formValidator'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    flags,
    recommendation,
    user: { token },
  } = res.locals

  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }

  res.locals = {
    ...res.locals,
    pageHeadings: renderStrings(strings.pageHeadings, stringRenderParams),
    pageTitles: renderStrings(strings.pageHeadings, { fullName: 'the person' }),
    backLink: flags.flagTriggerWork ? 'task-list-consider-recall' : 'response-to-probation',
    page: {
      id: 'licenceConditions',
    },
    errors: renderErrorMessages(res.locals.errors, stringRenderParams),
    formOptions: renderFormOptions(stringRenderParams),
  }

  res.locals.inputDisplayValues = inputDisplayValuesLicenceConditions({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.locals.caseSummary = await fetchAndTransformLicenceConditions({
    crn: recommendation.crn,
    token,
  })

  res.render(`pages/recommendations/licenceConditions`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateLicenceConditionsBreached({
    requestBody: req.body,
    recommendationId,
    urlInfo,
    token,
  })

  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, `${routeUrls.recommendations}/${recommendationId}/licence-conditions`)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  const nextPageId = flags.flagTriggerWork ? 'task-list-consider-recall' : 'alternatives-tried'
  res.redirect(303, nextPageLinkUrl({ nextPageId, urlInfo }))
}

export default { get, post }
