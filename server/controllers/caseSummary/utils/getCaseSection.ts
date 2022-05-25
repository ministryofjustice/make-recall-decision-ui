import { ParsedQs } from 'qs'
import { CaseSectionId, ObjectMap } from '../../../@types'
import { CaseSummaryOverviewResponse } from '../../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponse'
import { getCaseSummary } from '../../../data/makeDecisionApiClient'
import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { CaseRisk } from '../../../@types/make-recall-decision-api/models/CaseRisk'
import { PersonDetailsResponse } from '../../../@types/make-recall-decision-api/models/PersonDetailsResponse'
import { fetchFromCacheOrApi } from '../../../data/fetchFromCacheOrApi'
import { transformLicenceHistory } from './transformLicenceHistory'
import { countLabel } from '../../../utils/utils'

export const getCaseSection = async (sectionId: CaseSectionId, crn: string, token: string, reqQuery?: ParsedQs) => {
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
      caseSummary = await getCaseSummary<CaseRisk>(trimmedCrn, sectionId, token)
      sectionLabel = 'Risk'
      break
    case 'personal-details':
      caseSummary = await getCaseSummary<PersonDetailsResponse>(trimmedCrn, sectionId, token)
      sectionLabel = 'Personal details'
      break
    case 'licence-history':
    case 'licence-history-data':
      caseSummaryRaw = await fetchFromCacheOrApi(
        () => getCaseSummary<LicenceHistoryResponse>(trimmedCrn, 'all-licence-history', token),
        `licenceHistory:${crn}`
      )
      transformed = transformLicenceHistory({
        caseSummary: caseSummaryRaw,
        filters: reqQuery as ObjectMap<string>,
      })
      errors = transformed.errors
      caseSummary = transformed.data
      sectionLabel = `${countLabel({
        count: transformed.data.contactCount,
        noun: 'contact',
      })} for ${trimmedCrn} - Licence history`
      break
    default:
      throw new Error(`getCaseSection: invalid sectionId: ${sectionId}`)
  }
  return {
    errors,
    caseSummary,
    caseSummaryRaw,
    section: {
      label: sectionLabel,
      id: sectionId,
    },
  }
}
