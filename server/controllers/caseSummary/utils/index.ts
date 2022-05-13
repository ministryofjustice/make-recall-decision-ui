import { CaseSectionId } from '../../../@types'
import { CaseOverview } from '../../../@types/make-recall-decision-api/models/CaseOverview'
import { sortListByDateField } from '../../../utils/dates'
import { getCaseSummary } from '../../../data/makeDecisionApiClient'
import { CaseLicenceHistory } from '../../../@types/make-recall-decision-api/models/CaseLicenceHistory'
import { CaseRisk } from '../../../@types/make-recall-decision-api/models/CaseRisk'
import { CasePersonalDetails } from '../../../@types/make-recall-decision-api/models/CasePersonalDetails'
import { CaseLicenceConditions } from '../../../@types/make-recall-decision-api/models/CaseLicenceConditions'
import { CaseContactLog } from '../../../@types/make-recall-decision-api/models/CaseContactLog'

const transformLicenceHistory = (caseSummary: CaseLicenceHistory) => {
  return {
    ...caseSummary,
    contactSummary: sortListByDateField({
      list: caseSummary.contactSummary,
      dateKey: 'contactStartDate',
      newestFirst: true,
    }),
  }
}

export const getCaseSection = async (sectionId: CaseSectionId, crn: string, token: string) => {
  let sectionLabel
  let caseSummary
  switch (sectionId) {
    case 'overview':
      caseSummary = await getCaseSummary<CaseOverview>(crn.trim(), sectionId, token)
      sectionLabel = 'Overview'
      break
    case 'risk':
      caseSummary = await getCaseSummary<CaseRisk>(crn.trim(), sectionId, token)
      sectionLabel = 'Risk'
      break
    case 'personal-details':
      caseSummary = await getCaseSummary<CasePersonalDetails>(crn.trim(), sectionId, token)
      sectionLabel = 'Personal details'
      break
    case 'licence-history':
      caseSummary = await getCaseSummary<CaseLicenceHistory>(crn.trim(), sectionId, token)
      caseSummary = transformLicenceHistory(caseSummary)
      sectionLabel = 'Licence history'
      break
    case 'licence-conditions':
      caseSummary = await getCaseSummary<CaseLicenceConditions>(crn.trim(), sectionId, token)
      sectionLabel = 'Licence conditions'
      break
    case 'contact-log':
      caseSummary = await getCaseSummary<CaseContactLog>(crn.trim(), sectionId, token)
      sectionLabel = 'Contact log'
      break
    default:
      throw new Error(`getCaseSection: invalid sectionId: ${sectionId}`)
  }
  return {
    caseSummary,
    section: {
      label: sectionLabel,
      id: sectionId,
    },
  }
}
