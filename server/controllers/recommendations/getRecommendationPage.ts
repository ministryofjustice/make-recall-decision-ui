import { Request, Response } from 'express'
import { createDocument, getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { pageMetaData } from './helpers/pageMetaData'
import { renderFormOptions } from './formOptions/formOptions'
import { renderErrorMessages } from '../../utils/errors'
import { fetchAndTransformLicenceConditions } from './licenceConditions/transform'
import { taskCompleteness } from './helpers/taskCompleteness'
import { isCaseRestrictedOrExcluded, isPreprodOrProd } from '../../utils/utils'
import { isInCustody } from './helpers/isInCustody'
import { renderStrings } from './helpers/renderStrings'
import { checkForRedirectPath } from './helpers/urls'
import { strings } from '../../textStrings/en'
import { AuditService } from '../../services/auditService'
import { updatePageReviewedStatus } from './helpers/updatePageReviewedStatus'
import { RecommendationDecorated } from '../../@types'

const auditService = new AuditService()

export const getRecommendationPage = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageUrlSlug } = req.params
  const {
    urlInfo,
    user: { token: userToken },
    flags,
  } = res.locals
  const { id, inputDisplayValues, reviewedProperty, propertyToRefresh } = pageMetaData(pageUrlSlug)
  let recommendation: RecommendationDecorated
  if (propertyToRefresh) {
    recommendation = await updateRecommendation(recommendationId, {}, userToken, flags, propertyToRefresh)
  } else {
    recommendation = await getRecommendation(recommendationId, userToken)
  }
  if (isCaseRestrictedOrExcluded(recommendation.userAccessResponse)) {
    res.locals.caseSummary = recommendation
    return res.render('pages/excludedRestrictedCrn')
  }

  // assess whether to redirect the user
  const redirectedPagePath = checkForRedirectPath({
    requestedPageId: pageUrlSlug,
    recallType: recommendation?.recallType?.selected?.value,
    basePathRecFlow: urlInfo.basePath,
    crn: recommendation.crn,
    recommendationStatus: recommendation.status,
  })
  if (redirectedPagePath) {
    return res.redirect(301, redirectedPagePath)
  }
  recommendation.isInCustody = isInCustody(recommendation.custodyStatus?.selected)
  res.locals.taskCompleteness = taskCompleteness(recommendation, flags)
  if (pageUrlSlug === 'preview-no-recall') {
    const { letterContent } = await createDocument(
      recommendationId,
      'no-recall-letter',
      { format: 'preview' },
      userToken
    )
    res.locals.letterContent = letterContent
  }
  if (['licence-conditions', 'offence-details'].includes(pageUrlSlug)) {
    res.locals.caseSummary = await fetchAndTransformLicenceConditions({
      crn: recommendation.crn,
      token: userToken,
    })
  }
  const stringRenderParams = {
    fullName: recommendation.personOnProbation.name,
  }
  res.locals.page = {
    id,
  }
  res.locals.pageHeadings = renderStrings(strings.pageHeadings, stringRenderParams)
  res.locals.pageTitles = renderStrings(strings.pageHeadings, { fullName: 'the person' })
  // get values to preload into form inputs
  if (inputDisplayValues) {
    res.locals.inputDisplayValues = inputDisplayValues({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    })
  }
  res.locals.errors = renderErrorMessages(res.locals.errors, stringRenderParams)
  res.locals.formOptions = renderFormOptions(stringRenderParams)
  res.locals.crn = recommendation.crn
  res.locals.recommendation = recommendation
  res.set({ 'Cache-Control': 'no-store' })
  res.render(`pages/recommendations/${id}`)
  if (reviewedProperty) {
    updatePageReviewedStatus({
      reviewedProperty,
      recommendationId,
      userToken,
    })
  }
  auditService.recommendationView({
    crn: res.locals.crn,
    recommendationId,
    pageUrlSlug,
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env) && process.env.NODE_ENV !== 'test',
  })
}
