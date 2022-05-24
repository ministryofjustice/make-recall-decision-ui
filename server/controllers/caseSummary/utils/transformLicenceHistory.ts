import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { ObjectMap } from '../../../@types'
import { filterContactsByDateRange } from './filterContactsByDateRange'
import { groupContactsByStartDate } from './groupContactsByStartDate'

const filterSystemGenerated = ({
  contacts,
  showSystemGenerated,
}: {
  contacts: ContactSummaryResponse[]
  showSystemGenerated?: string
}): ContactSummaryResponse[] => {
  if (showSystemGenerated === 'YES') {
    return contacts
  }
  return contacts.filter((contact: ContactSummaryResponse) => contact.systemGenerated === false)
}

export const transformLicenceHistory = ({
  caseSummary,
  filters,
}: {
  caseSummary: LicenceHistoryResponse
  filters: ObjectMap<string>
}) => {
  const filteredBySystemGenerated = filterSystemGenerated({
    contacts: caseSummary.contactSummary,
    showSystemGenerated: filters.showSystemGenerated,
  })
  const { errors, contacts, selectedLabel } = filterContactsByDateRange({
    contacts: filteredBySystemGenerated,
    filters,
  })
  return {
    errors,
    data: {
      ...caseSummary,
      contactSummary: groupContactsByStartDate(contacts),
      contactCount: contacts.length,
      filters: {
        dateRange: {
          selectedLabel,
          dateFrom: {
            day: filters[`dateFrom-day`],
            month: filters[`dateFrom-month`],
            year: filters[`dateFrom-year`],
          },
          dateTo: {
            day: filters[`dateTo-day`],
            month: filters[`dateTo-month`],
            year: filters[`dateTo-year`],
          },
        },
      },
    },
  }
}
