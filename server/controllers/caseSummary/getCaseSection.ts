import { ParsedQs } from 'qs'
import { performance } from 'perf_hooks'
import { CaseSummaryOverviewResponse } from '../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponse'
import { CaseSummaryOverviewResponseV2 } from '../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponseV2'
import { getCaseSummary, getCaseSummaryV2 } from '../../data/makeDecisionApiClient'
import { ContactHistoryResponse } from '../../@types/make-recall-decision-api/models/ContactHistoryResponse'
import { RiskResponse } from '../../@types/make-recall-decision-api/models/RiskResponse'
import { PersonDetailsResponse } from '../../@types/make-recall-decision-api/models/PersonDetailsResponse'
import { fetchFromCacheOrApi } from '../../data/fetchFromCacheOrApi'
import { transformContactHistory } from './contactHistory/transformContactHistory'
import { isCaseRestrictedOrExcluded } from '../../utils/utils'
import { AppError } from '../../AppError'
import { transformLicenceConditions } from './licenceConditions/transformLicenceConditions'
import { transformRiskManagementPlan } from './overview/transformRiskManagementPlan'
import { appInsightsTimingMetric } from '../../monitoring/azureAppInsights'
import { VulnerabilitiesResponse } from '../../@types/make-recall-decision-api/models/VulnerabilitiesResponse'
import { transformVulnerabilities } from './vulnerabilities/transformVulnerabilities'
import { transformRisk } from './risk/transformRisk'
import { RecommendationsResponse } from '../../@types/make-recall-decision-api'
import { transformRecommendations } from './recommendations/transformRecommendations'
import { ContactHistoryFilters } from '../../@types/contacts'
import { CaseSectionId } from '../../@types/pagesForms'
import { formOptions } from '../recommendations/formOptions/formOptions'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { LastCompletedRecommendationsResponse } from '../../@types/make-recall-decision-api/models/LastCompletedRecommendationsResponse'

export const getCaseSection = async (
  sectionId: CaseSectionId,
  crn: string,
  token: string,
  userId: string,
  reqQuery: ParsedQs,
  flags: Record<string, boolean>
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
      caseSummaryRaw = await getCaseSummary<RiskResponse>(trimmedCrn, sectionId, token)
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        caseSummary = transformRisk(caseSummaryRaw)
      }
      appInsightsTimingMetric({ name: 'getCaseRisk', startTime })
      sectionLabel = 'Risk'
      break
    case 'vulnerabilities':
      startTime = performance.now()
      caseSummaryRaw = await getCaseSummary<VulnerabilitiesResponse>(trimmedCrn, sectionId, token)
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        caseSummary = transformVulnerabilities(caseSummaryRaw)
      }
      appInsightsTimingMetric({ name: 'getCaseVulnerabilities', startTime })
      sectionLabel = 'Vulnerabilities'
      break
    case 'personal-details':
      caseSummary = await getCaseSummary<PersonDetailsResponse>(trimmedCrn, sectionId, token)
      sectionLabel = 'Personal details'
      break
    case 'licence-conditions':
      sectionLabel = 'Licence conditions'
      startTime = performance.now()
      if (flags.flagCvl) {
        const json = await getCaseSummaryV2<CaseSummaryOverviewResponseV2>(trimmedCrn, sectionId, token)
        appInsightsTimingMetric({ name: 'getCaseLicenceConditionsV2', startTime })
        caseSummary = {
          ...json,
          licenceConvictions: {
            activeCustodial: json.activeConvictions.filter(conviction => conviction.sentence?.isCustodial),
            hasMultipleActiveCustodial:
              json.activeConvictions.filter(conviction => conviction.sentence?.isCustodial).length > 1,
          },
          standardLicenceConditions: formOptions.standardLicenceConditions,
        }
      } else {
        caseSummaryRaw = await getCaseSummary<CaseSummaryOverviewResponse>(trimmedCrn, sectionId, token)
        appInsightsTimingMetric({ name: 'getCaseLicenceConditions', startTime })
        if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
          caseSummary = transformLicenceConditions(caseSummaryRaw) as CaseSummaryOverviewResponse
        }
      }
      break
    case 'licence-conditions-cvl':
      sectionLabel = 'Licence conditions (Create & vary a licence)'
      caseSummary = await getCaseSummary<CaseSummaryOverviewResponse>(trimmedCrn, sectionId, token)
      break
    case 'contact-history':
      sectionLabel = 'Contact history'
      caseSummaryRaw = await fetchFromCacheOrApi({
        fetchDataFn: async () => {
          startTime = performance.now()
          const response = await getCaseSummary<ContactHistoryResponse>(trimmedCrn, 'contact-history', token)
          appInsightsTimingMetric({ name: 'getCaseContactHistory', startTime })
          return response
        },
        checkWhetherToCacheDataFn: apiResponse => !isCaseRestrictedOrExcluded(apiResponse.userAccessResponse),
        userId,
        redisKey: `contactHistory:${trimmedCrn}`,
      })
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        transformed = transformContactHistory({
          caseSummary: caseSummaryRaw,
          filters: reqQuery as unknown as ContactHistoryFilters,
        })
        errors = transformed.errors
        caseSummary = transformed.data
        sectionLabel = 'Contact history'
      }
      break
    case 'recommendations':
      sectionLabel = 'Recommendations'
      caseSummaryRaw = await getCaseSummary<RecommendationsResponse>(trimmedCrn, 'recommendations', token)
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        caseSummary = transformRecommendations(caseSummaryRaw)
      }
      break
    case 'last-completed':
      sectionLabel = 'Last completed document'
      caseSummaryRaw = await getCaseSummary<LastCompletedRecommendationsResponse>(trimmedCrn, 'last-completed', token)
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        caseSummary = {
          ...caseSummaryRaw,
          recommendations: caseSummaryRaw.recommendations?.map(recommendation => ({
            ...recommendation,
            completedDate: recommendation.statuses.find(status => status.active && status.name === STATUSES.COMPLETED)
              .created,
            recallType: recommendation.recallType.selected.value,
          })),
        }
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
