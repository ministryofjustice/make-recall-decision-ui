import { ParsedQs } from 'qs'
import { CaseSectionId } from '../../../@types'
import { CaseOverview } from '../../../@types/make-recall-decision-api/models/CaseOverview'
import { sortListByDateField } from '../../../utils/dates'
import { getCaseSummary } from '../../../data/makeDecisionApiClient'
import { CaseLicenceHistory } from '../../../@types/make-recall-decision-api/models/CaseLicenceHistory'
import { CaseRisk } from '../../../@types/make-recall-decision-api/models/CaseRisk'
import { CasePersonalDetails } from '../../../@types/make-recall-decision-api/models/CasePersonalDetails'
import { CaseLicenceConditions } from '../../../@types/make-recall-decision-api/models/CaseLicenceConditions'
import { CaseContactLog } from '../../../@types/make-recall-decision-api/models/CaseContactLog'
import { ContactSummary } from '../../../@types/make-recall-decision-api/models/ContactSummary'
import { fetchFromCacheOrApi } from '../../../data/fetchFromCacheOrApi'

const transformLicenceHistory = (caseSummary: CaseLicenceHistory, showSystemGenerated: boolean) => {
  const filtered = showSystemGenerated
    ? caseSummary.contactSummary
    : caseSummary.contactSummary.filter((contact: ContactSummary) => contact.systemGenerated === false)
  return {
    ...caseSummary,
    contactSummary: sortListByDateField({
      list: filtered,
      dateKey: 'contactStartDate',
      newestFirst: true,
    }),
  }
}

export const getCaseSection = async (sectionId: CaseSectionId, crn: string, token: string, reqQuery?: ParsedQs) => {
  let sectionLabel
  let caseSummary
  let props = {}
  const trimmedCrn = crn.trim()
  let showSystemGenerated
  switch (sectionId) {
    case 'overview':
      caseSummary = await getCaseSummary<CaseOverview>(trimmedCrn, sectionId, token)
      sectionLabel = 'Overview'
      break
    case 'risk':
      caseSummary = await getCaseSummary<CaseRisk>(trimmedCrn, sectionId, token)
      sectionLabel = 'Risk'
      break
    case 'personal-details':
      caseSummary = await getCaseSummary<CasePersonalDetails>(trimmedCrn, sectionId, token)
      sectionLabel = 'Personal details'
      break
    case 'licence-history':
    case 'licence-history-data':
      showSystemGenerated = reqQuery.showSystemGenerated || 'NO'
      caseSummary = await fetchFromCacheOrApi(
        () => getCaseSummary<CaseLicenceHistory>(trimmedCrn, 'all-licence-history', token),
        `licenceHistory:${crn}`
      )
      caseSummary = transformLicenceHistory(caseSummary, showSystemGenerated === 'YES')
      props = {
        filters: {
          showSystemGenerated,
        },
      }
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
    ...props,
    caseSummary,
    section: {
      label: sectionLabel,
      id: sectionId,
    },
  }
}
