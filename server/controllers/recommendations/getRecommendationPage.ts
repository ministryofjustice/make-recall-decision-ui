import { Request, Response } from 'express'
import { createDocument, getRecommendation } from '../../data/makeDecisionApiClient'
import { pageMetaData } from './helpers/pageMetaData'
import { renderFormOptions } from './formOptions/formOptions'
import { renderErrorMessages } from '../../utils/errors'
import { fetchAndTransformLicenceConditions } from './licenceConditions/transform'
import { taskCompleteness } from './helpers/taskCompleteness'
import { isCaseRestrictedOrExcluded, isPreprodOrProd } from '../../utils/utils'
import { isInCustody } from './helpers/isInCustody'
import { renderStrings } from './helpers/renderStrings'
import { validateUpdateRecommendationPageRequest } from './helpers/urls'
import { strings } from '../../textStrings/en'
import { AuditService } from '../../services/auditService'
import { updatePageReviewedStatus } from './helpers/updatePageReviewedStatus'

const auditService = new AuditService()

export const getRecommendationPage = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId, pageUrlSlug } = req.params
  const {
    user: { token: userToken },
  } = res.locals
  const { id, inputDisplayValues } = pageMetaData(pageUrlSlug)
  res.locals.recommendation = await getRecommendation(recommendationId, userToken)
  if (isCaseRestrictedOrExcluded(res.locals.recommendation.userAccessResponse)) {
    res.locals.caseSummary = res.locals.recommendation
    return res.render('pages/excludedRestrictedCrn')
  }

  // the user clicked "Update recommendation" button - work out where to redirect them to
  const redirectedPageId = validateUpdateRecommendationPageRequest({
    requestedPageId: pageUrlSlug,
    recallType: res.locals.recommendation?.recallType?.selected?.value,
  })
  if (redirectedPageId) {
    return res.redirect(303, `${res.locals.urlInfo.basePath}${redirectedPageId}`)
  }
  res.locals.recommendation.isInCustody = isInCustody(res.locals.recommendation.custodyStatus?.selected)
  res.locals.taskCompleteness = taskCompleteness(res.locals.recommendation, res.locals.flags)
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
      crn: res.locals.recommendation.crn,
      token: userToken,
    })
  }
  const stringRenderParams = {
    fullName: res.locals.recommendation.personOnProbation.name,
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
      apiValues: res.locals.recommendation,
    })
  }
  res.locals.errors = renderErrorMessages(res.locals.errors, stringRenderParams)
  res.locals.formOptions = renderFormOptions(stringRenderParams)
  res.locals.crn = res.locals.recommendation.crn
  res.set({ 'Cache-Control': 'no-store' })
  res.render(`pages/recommendations/${id}`)
  updatePageReviewedStatus({
    pageUrlSlug,
    recommendationId,
    userToken,
  })
  auditService.recommendationView({
    crn: res.locals.crn,
    recommendationId,
    pageUrlSlug,
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env) && process.env.NODE_ENV !== 'test',
  })
}
