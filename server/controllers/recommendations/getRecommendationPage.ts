import { Request, Response } from 'express'
import { getRecommendation } from '../../data/makeDecisionApiClient'
import { pageMetaData } from './helpers/pageMetaData'
import { formOptions } from './helpers/formOptions'
import { renderTemplateString } from '../../utils/nunjucks'
import { renderErrorMessages } from '../../utils/errors'
import { fetchAndTransformLicenceConditions } from './licenceConditions/transform'
import { taskCompleteness } from './helpers/taskCompleteness'
import { isCaseRestrictedOrExcluded } from '../../utils/utils'
import { isInCustody } from './helpers/isInCustody'
import { renderPageHeadings } from './helpers/renderPageHeadings'

export const getRecommendationPage = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageId } = req.params
  const { user } = res.locals
  const { templateName, pageHeading, pageTitle, inputDisplayValues } = pageMetaData(pageId)
  res.locals.recommendation = await getRecommendation(recommendationId, user.token)
  if (isCaseRestrictedOrExcluded(res.locals.recommendation.userAccessResponse)) {
    res.locals.caseSummary = res.locals.recommendation
    return res.render('pages/excludedRestrictedCrn')
  }
  res.locals.recommendation.isInCustody = isInCustody(res.locals.recommendation.custodyStatus?.selected)
  res.locals.taskCompleteness = taskCompleteness(res.locals.recommendation)
  if (pageId === 'licence-conditions') {
    res.locals.caseSummary = await fetchAndTransformLicenceConditions({
      crn: res.locals.recommendation.crn,
      token: user.token,
    })
  }
  const stringRenderParams = {
    fullName: res.locals.recommendation.personOnProbation.name,
  }

  // TODO - use pageHeadings instead of pageHeading property
  res.locals.pageHeading = renderTemplateString(pageHeading, stringRenderParams)
  res.locals.pageHeadings = renderPageHeadings(stringRenderParams)
  res.locals.pageTitle = pageTitle
  // get values to preload into form inputs
  if (inputDisplayValues) {
    res.locals.inputDisplayValues = inputDisplayValues({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: res.locals.recommendation,
    })
  }
  res.locals.errors = renderErrorMessages(res.locals.errors, stringRenderParams)
  res.locals.formOptions = formOptions
  res.locals.crn = res.locals.recommendation.crn
  res.render(`pages/recommendations/${templateName}`)
}
