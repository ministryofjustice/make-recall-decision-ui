import { ParsedQs } from 'qs'
import { CaseSectionId, ObjectMap } from '../../../@types'
import { CaseSummaryOverviewResponse } from '../../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponse'
import { getCaseSummary } from '../../../data/makeDecisionApiClient'
import { CaseLicenceHistory } from '../../../@types/make-recall-decision-api/models/CaseLicenceHistory'
import { CaseRisk } from '../../../@types/make-recall-decision-api/models/CaseRisk'
import { PersonalDetailsResponse } from '../../../@types/make-recall-decision-api/models/PersonalDetailsResponse'
import { CaseLicenceConditions } from '../../../@types/make-recall-decision-api/models/CaseLicenceConditions'
import { CaseContactLog } from '../../../@types/make-recall-decision-api/models/CaseContactLog'
import { fetchFromCacheOrApi } from '../../../data/fetchFromCacheOrApi'
import { transformLicenceHistory } from './transformLicenceHistory'

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
      caseSummary = await getCaseSummary<PersonalDetailsResponse>(trimmedCrn, sectionId, token)
      sectionLabel = 'Personal details'
      break
    case 'licence-history':
    case 'licence-history-data':
      caseSummaryRaw = await fetchFromCacheOrApi(
        () => getCaseSummary<CaseLicenceHistory>(trimmedCrn, 'all-licence-history', token),
        `licenceHistory:${crn}`
      )
      transformed = transformLicenceHistory({
        caseSummary: caseSummaryRaw,
        filters: reqQuery as ObjectMap<string>,
      })
      errors = transformed.errors
      caseSummary = transformed.data
      sectionLabel = 'Licence history'
      break
    case 'licence-conditions':
      caseSummary = await getCaseSummary<CaseLicenceConditions>(trimmedCrn, sectionId, token)
      sectionLabel = 'Licence conditions'
      break
    case 'contact-log':
      caseSummary = await getCaseSummary<CaseContactLog>(trimmedCrn, sectionId, token)
      sectionLabel = 'Contact log'
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
