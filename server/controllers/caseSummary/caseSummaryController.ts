import { NextFunction, Request, Response } from 'express'
import {
  isBannerDisplayDateRangeValid,
  isCaseRestrictedOrExcluded,
  isPreprodOrProd,
  isString,
  validateCrn,
} from '../../utils/utils'

import { getCaseSection } from './getCaseSection'
import { transformErrorMessages } from '../../utils/errors'
import { AuditService } from '../../services/auditService'
import { AppError } from '../../AppError'
import { strings } from '../../textStrings/en'
import { CaseSectionId } from '../../@types/pagesForms'
import {
  getActiveRecommendation,
  getRecommendation,
  getStatuses,
  searchForPrisonOffender,
  updateRecommendation,
} from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import config from '../../config'
import raiseWarningBannerEvents from '../raiseWarningBannerEvents'
import { RecommendationDecorated } from '../../@types/api'
import { PrisonOffenderSearchResponse } from '../../@types/make-recall-decision-api/models/PrisonOffenderSearchResponse'

interface RecommendationButton {
  display: boolean
  post?: boolean
  title?: string
  dataAnalyticsEventCategory?: string
  link?: string
}

interface RecommendationBanner {
  display: boolean
  createdByUserFullName?: string
  createdDate?: string
  personOnProbationName?: string
  dataAnalyticsEventCategory?: string
  recommendationId?: string
  linkText?: string
  text?: string
}

const auditService = new AuditService()

async function get(req: Request, res: Response, _: NextFunction) {
  const { crn, sectionId, recommendationId } = req.params
  const { user, flags } = res.locals
  const { token, userId, roles } = user
  if (!isString(sectionId)) {
    throw new AppError('Invalid section ID', { status: 404 })
  }
  const normalizedCrn = validateCrn(crn)
  const { errors, ...caseSection } = await getCaseSection(
    sectionId as CaseSectionId,
    normalizedCrn,
    token,
    userId,
    req.query,
    flags
  )
  if (errors) {
    res.locals.errors = transformErrorMessages(errors)
  }

  let pageUrlBase = `/cases/${normalizedCrn}/`
  let backLink = '/search'

  let isOutOfHoursWorker =
    user.roles.includes('ROLE_MARD_RESIDENT_WORKER') || user.roles.includes('ROLE_MARD_DUTY_MANAGER')

  let nomisPrisonOffender: PrisonOffenderSearchResponse | undefined
  if (isOutOfHoursWorker) {
    nomisPrisonOffender = (await searchForPrisonOffender(
      token,
      caseSection.caseSummary.personalDetailsOverview?.nomsNumber
    )) as PrisonOffenderSearchResponse
  }

  const prisonBookingNumber = nomisPrisonOffender?.bookingNo
  const isSpo = roles.includes('ROLE_MAKE_RECALL_DECISION_SPO')
  // disabling this rule temporarily until we elaborate on the role model so that people can be explicitly out of hours and probation practitioners.
  // if not an SPO, and not an OOH worker, then the user has only the base role is and is therefore a PP because we haven't extended the role model properly.
  // const isProbationPractitioner = !isSpo && !isOutOfHoursWorker
  const isProbationPractitioner = !isSpo
  let recommendationButton: RecommendationButton = { display: false }
  const recommendationBanner: RecommendationBanner = { display: false }

  if (recommendationId) {
    // this will be true when the SPO is reviewing the case during the SPO consider recall flow.
    pageUrlBase = `/recommendations/${recommendationId}/review-case/${normalizedCrn}/`
    backLink = `/recommendations/${recommendationId}/spo-task-list-consider-recall`

    recommendationButton = {
      display: true,
      post: true,
      title: 'Continue',
    }
    isOutOfHoursWorker = false
  } else {
    const activeRecommendation = await getActiveRecommendation(normalizedCrn, token, flags)

    if (!activeRecommendation) {
      if (isProbationPractitioner) {
        recommendationButton = {
          display: true,
          post: false,
          title: 'Make a recommendation',
          dataAnalyticsEventCategory: 'make_recommendation_click',
          link: `${pageUrlBase}create-recommendation-warning`,
        }
      }
    } else if (isSpo) {
      const recommendation: RecommendationDecorated = await getRecommendation(
        String(activeRecommendation.recommendationId),
        user.token
      )

      const statuses = (
        await getStatuses({
          recommendationId: String(activeRecommendation.recommendationId),
          token,
        })
      ).filter(status => status.active)

      const isSpoConsiderRecall = statuses.find(status => status.name === STATUSES.SPO_CONSIDER_RECALL)

      const isSpoSignatureRequested = statuses.find(status => status.name === STATUSES.SPO_SIGNATURE_REQUESTED)

      const isAcoSignatureRequested = statuses.find(status => status.name === STATUSES.ACO_SIGNATURE_REQUESTED)

      // Recommendation banner should only be visible for the following statuses
      const isDoNotRecall = statuses.find(status => status.name === STATUSES.NO_RECALL_DECIDED)
      const isRecallDecided = statuses.find(status => status.name === STATUSES.RECALL_DECIDED)
      const isRecallStarted = statuses.find(status => status.name === STATUSES.PO_START_RECALL)

      recommendationBanner.display = true
      recommendationBanner.createdByUserFullName = recommendation.createdByUserFullName
      recommendationBanner.createdDate = recommendation.createdDate
      recommendationBanner.personOnProbationName = recommendation.personOnProbation.name
      recommendationBanner.recommendationId = String(activeRecommendation.recommendationId)

      if (isDoNotRecall) {
        recommendationBanner.text = 'started a decision not to recall letter for'
        recommendationBanner.linkText = 'Delete the decision not to recall'
        recommendationBanner.dataAnalyticsEventCategory = 'spo_delete_dntr_click'
      } else if (isRecallDecided) {
        recommendationBanner.text = 'started a Part A for'
        recommendationBanner.linkText = 'Delete the Part A'
        recommendationBanner.dataAnalyticsEventCategory = 'spo_delete_part_a_click'
      } else if (isRecallStarted) {
        recommendationBanner.text = 'started a recommendation for'
        recommendationBanner.linkText = 'Delete the recommendation'
        recommendationBanner.dataAnalyticsEventCategory = 'spo_delete_recommendation_click'
      } else {
        recommendationBanner.display = false
      }

      if (isSpoSignatureRequested || isAcoSignatureRequested) {
        recommendationButton = {
          display: true,
          post: false,
          title: 'Countersign',
          dataAnalyticsEventCategory: 'spo_countersign_click',
          link: `/recommendations/${activeRecommendation.recommendationId}/task-list`,
        }
      } else if (isSpoConsiderRecall) {
        recommendationButton = {
          display: true,
          post: false,
          title: 'Consider a recall',
          dataAnalyticsEventCategory: 'spo_consider_recall_click',
          link: `/recommendations/${activeRecommendation.recommendationId}/`,
        }
      }
    } else if (isProbationPractitioner) {
      const statuses = (
        await getStatuses({
          recommendationId: String(activeRecommendation.recommendationId),
          token,
        })
      ).filter(status => status.active)

      const isWithPpcs = statuses.find(status => status.name === STATUSES.SENT_TO_PPCS)
      const isPPDocumentCreated = statuses.find(status => status.name === STATUSES.PP_DOCUMENT_CREATED)
      if (isWithPpcs) {
        // Only part A is ever with PPCS.

        // This looks wrongs as we know we have an open rec doc, and we are creating a new one.  Business want this.
        // It's a problem for SPO rationale.  We currently don't enforce that the rationale has been supplied, so if
        // there are two active docs, then the spo rationale can only be supplied on the most recent.  We can therefore
        // never enforce that a rationale is supplied on the old one.
        recommendationButton = {
          display: true,
          post: false,
          title: 'Make a recommendation',
          dataAnalyticsEventCategory: 'make_recommendation_click',
          link: `${pageUrlBase}create-recommendation-warning`,
        }
      } else if (isPPDocumentCreated) {
        recommendationButton = {
          display: true,
          post: false,
          title: 'Make a recommendation',
          dataAnalyticsEventCategory: 'make_recommendation_click',
          link: `${pageUrlBase}replace-recommendation/${activeRecommendation.recommendationId}/`,
        }
      } else {
        recommendationButton = {
          display: true,
          post: false,
          title: 'Update recommendation',
          dataAnalyticsEventCategory: 'update_recommendation_click',
          link: `/recommendations/${activeRecommendation.recommendationId}/`,
        }
      }
    }
  }

  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.body) && isBannerDisplayDateRangeValid(),
  }

  res.locals = {
    ...res.locals,
    crn: normalizedCrn,
    ...caseSection,
    notifications: strings.notifications,
    showOutOfHoursRecallButton: isOutOfHoursWorker,
    prisonBookingNumber,
    recommendationButton,
    recommendationBanner,
    backLink,
    pageUrlBase,
  }
  const page = isCaseRestrictedOrExcluded(caseSection.caseSummary.userAccessResponse)
    ? 'pages/excludedRestrictedCrn'
    : 'pages/caseSummary'

  if (sectionId === 'licence-conditions') {
    raiseWarningBannerEvents(
      res.locals.caseSummary?.licenceConvictions?.activeCustodial?.length,
      res.locals.caseSummary.hasAllConvictionsReleasedOnLicence,
      user,
      normalizedCrn,
      flags
    )
  }

  res.render(page)
  await auditService.caseSummaryView({
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
