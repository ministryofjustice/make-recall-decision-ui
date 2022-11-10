import { ParsedQs } from 'qs'
import { performance } from 'perf_hooks'
import { CaseSectionId, ContactHistoryFilters, ObjectMap } from '../../@types'
import { CaseSummaryOverviewResponse } from '../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponse'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { ContactHistoryResponse } from '../../@types/make-recall-decision-api/models/ContactHistoryResponse'
import { RiskResponse } from '../../@types/make-recall-decision-api/models/RiskResponse'
import { PersonDetailsResponse } from '../../@types/make-recall-decision-api/models/PersonDetailsResponse'
import { fetchFromCacheOrApi } from '../../data/fetchFromCacheOrApi'
import { transformContactHistory } from './contactHistory/transformContactHistory'
import { isCaseRestrictedOrExcluded } from '../../utils/utils'
import { AppError } from '../../AppError'
import { transformLicenceConditions } from './licenceConditions/transformLicenceConditions'
import getRecommendationsResponse from '../../../api/responses/get-recommendations.json'
import { transformRiskManagementPlan } from './overview/transformRiskManagementPlan'
import { appInsightsTimingMetric } from '../../monitoring/azureAppInsights'

export const getCaseSection = async (
  sectionId: CaseSectionId,
  crn: string,
  token: string,
  userId: string,
  reqQuery: ParsedQs,
  featureFlags: ObjectMap<boolean>
) => {
  let sectionLabel
  let caseSummary
  let caseSummaryRaw
  let transformed
  let errors
  let startTime
  const trimmedCrn = crn.trim()
  switch (sectionId) {
    case 'overview':
      startTime = performance.now()
      caseSummaryRaw = await getCaseSummary<CaseSummaryOverviewResponse>(trimmedCrn, sectionId, token)
      appInsightsTimingMetric({ name: 'getCaseOverview', startTime })
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        caseSummary = transformLicenceConditions(caseSummaryRaw) as unknown as CaseSummaryOverviewResponse
        caseSummary.risk.riskManagementPlan = transformRiskManagementPlan(caseSummary.risk.riskManagementPlan)
      }
      sectionLabel = 'Overview'
      break
    case 'risk':
      startTime = performance.now()
      caseSummary = await getCaseSummary<RiskResponse>(trimmedCrn, sectionId, token)
      appInsightsTimingMetric({ name: 'getCaseRisk', startTime })
      sectionLabel = 'Risk'
      break
    case 'personal-details':
      caseSummary = await getCaseSummary<PersonDetailsResponse>(trimmedCrn, sectionId, token)
      sectionLabel = 'Personal details'
      break
    case 'licence-conditions':
      sectionLabel = 'Licence conditions'
      startTime = performance.now()
      caseSummaryRaw = await getCaseSummary<CaseSummaryOverviewResponse>(trimmedCrn, sectionId, token)
      appInsightsTimingMetric({ name: 'getCaseLicenceConditions', startTime })
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        caseSummary = transformLicenceConditions(caseSummaryRaw)
      }
      break
    case 'licence-conditions-cvl':
      sectionLabel = 'Licence conditions (Create & vary a licence)'
      caseSummary = await getCaseSummary<CaseSummaryOverviewResponse>(trimmedCrn, sectionId, token)
      break
    case 'contact-history':
      sectionLabel = 'Contact history'
      caseSummaryRaw = await fetchFromCacheOrApi({
        fetchDataFn: () => getCaseSummary<ContactHistoryResponse>(trimmedCrn, 'contact-history', token),
        checkWhetherToCacheDataFn: apiResponse => !isCaseRestrictedOrExcluded(apiResponse.userAccessResponse),
        userId,
        redisKey: `contactHistory:${trimmedCrn}`,
      })
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        transformed = transformContactHistory({
          caseSummary: caseSummaryRaw,
          filters: reqQuery as unknown as ContactHistoryFilters,
          featureFlags,
        })
        errors = transformed.errors
        caseSummary = transformed.data
        sectionLabel = 'Contact history'
      }
      break
    case 'recommendations':
      sectionLabel = 'Recommendations'
      caseSummary = await getCaseSummary<PersonDetailsResponse>(trimmedCrn, 'personal-details', token)
      break
    case 'recommendations-prototype':
      sectionLabel = 'Recommendations'
      caseSummaryRaw = await getCaseSummary<PersonDetailsResponse>(trimmedCrn, 'personal-details', token)
      caseSummary = {
        ...caseSummaryRaw,
        recommendations: getRecommendationsResponse,
      }
      break
    default:
      throw new AppError(`getCaseSection: invalid sectionId: ${sectionId}`, { status: 404 })
  }
  caseSummary = caseSummary || caseSummaryRaw
  return {
    errors,
    caseSummary,
    section: {
      label: sectionLabel,
      id: sectionId,
    },
  }
}
