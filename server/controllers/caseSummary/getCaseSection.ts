import { ParsedQs } from 'qs'
import { CaseSectionId, ContactHistoryFilters, ObjectMap } from '../../@types'
import { CaseSummaryOverviewResponse } from '../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponse'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { ContactHistoryResponse } from '../../@types/make-recall-decision-api/models/ContactHistoryResponse'
import { RiskResponse } from '../../@types/make-recall-decision-api/models/RiskResponse'
import { PersonDetailsResponse } from '../../@types/make-recall-decision-api/models/PersonDetailsResponse'
import { fetchFromCacheOrApi } from '../../data/fetchFromCacheOrApi'
import { transformContactHistory } from './contactHistory/transformContactHistory'
import { countLabel, isCaseRestrictedOrExcluded } from '../../utils/utils'
import { LicenceConditionsResponse } from '../../@types/make-recall-decision-api'
import { transformLicenceConditions } from './licenceConditions/transformLicenceConditions'
import { AppError } from '../../AppError'

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
  const trimmedCrn = crn.trim()
  switch (sectionId) {
    case 'overview':
      caseSummary = await getCaseSummary<CaseSummaryOverviewResponse>(trimmedCrn, sectionId, token)
      sectionLabel = 'Overview'
      break
    case 'risk':
      caseSummary = await getCaseSummary<RiskResponse>(trimmedCrn, sectionId, token)
      sectionLabel = 'Risk'
      break
    case 'personal-details':
      caseSummary = await getCaseSummary<PersonDetailsResponse>(trimmedCrn, sectionId, token)
      sectionLabel = 'Personal details'
      break
    case 'licence-conditions':
      sectionLabel = 'Licence conditions'
      caseSummaryRaw = await getCaseSummary<LicenceConditionsResponse>(trimmedCrn, sectionId, token)
      if (!isCaseRestrictedOrExcluded(caseSummaryRaw.userAccessResponse)) {
        caseSummary = transformLicenceConditions(caseSummaryRaw)
      }
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
        sectionLabel = `${countLabel({
          count: transformed.data.contactCount,
          noun: 'contact',
        })} for ${trimmedCrn} - Contact history`
      }
      break
    case 'prototype-recommendations':
      sectionLabel = 'Recommendations'
      caseSummary = await getCaseSummary<PersonDetailsResponse>(trimmedCrn, 'personal-details', token)
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
