import { NextFunction, Request, Response } from 'express'
import { isCaseRestrictedOrExcluded, isPreprodOrProd, isString, validateCrn } from '../../utils/utils'
import { getCaseSection } from './getCaseSection'
import { transformErrorMessages } from '../../utils/errors'
import { AuditService } from '../../services/auditService'
import { AppError } from '../../AppError'
import { strings } from '../../textStrings/en'
import { CaseSectionId } from '../../@types/pagesForms'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'

const auditService = new AuditService()

async function get(req: Request, res: Response, _: NextFunction) {
  const { crn, sectionId, recommendationId } = req.params
  if (!isString(sectionId)) {
    throw new AppError('Invalid section ID', { status: 404 })
  }
  const normalizedCrn = validateCrn(crn)
  const { errors, ...caseSection } = await getCaseSection(
    sectionId as CaseSectionId,
    normalizedCrn,
    res.locals.user.token,
    res.locals.user.userId,
    req.query
  )
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
  }

  let pageUrlBase = `/cases/${normalizedCrn}/`
  let backLink = '/search'
  const recommendationButton = {
    post: false,
    title: 'Make a recommendation',
    dataAnalyticsEventCategory: 'make_recommendation_click',
    link: `${pageUrlBase}create-recommendation-warning`,
  }

  if (caseSection.caseSummary.activeRecommendation?.recommendationId) {
    recommendationButton.title = 'Update recommendation'
    recommendationButton.dataAnalyticsEventCategory = 'update_recommendation_click'
    recommendationButton.link = `/recommendations/${caseSection.caseSummary.activeRecommendation.recommendationId}/`
  }

  if (recommendationId) {
    pageUrlBase = `/recommendations/${recommendationId}/review-case/${normalizedCrn}/`
    backLink = `/recommendations/${recommendationId}/spo-task-list-consider-recall`
    recommendationButton.post = true
    recommendationButton.title = 'Continue'
    delete recommendationButton.dataAnalyticsEventCategory
    recommendationButton.link = `/recommendations/${recommendationId}/spo-task-list-consider-recall`
  }

  res.locals = {
    ...res.locals,
    crn: normalizedCrn,
    ...caseSection,
    notifications: strings.notifications,
    recommendationButton,
    backLink,
    pageUrlBase,
  }
  const page = isCaseRestrictedOrExcluded(caseSection.caseSummary.userAccessResponse)
    ? 'pages/excludedRestrictedCrn'
    : 'pages/caseSummary'
  res.render(page)
  auditService.caseSummaryView({
    crn: normalizedCrn,
    sectionId,
    username: res.locals.user.username,
    logErrors: isPreprodOrProd(res.locals.env) && process.env.NODE_ENV !== 'test',
  })
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params

  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      reviewOffenderProfile: true,
    },
    token,
    featureFlags: flags,
  })
  res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-task-list-consider-recall', urlInfo }))
}

export default { get, post }
