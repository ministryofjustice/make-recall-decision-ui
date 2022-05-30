import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { ObjectMap } from '../../../@types'
import { filterContactsByDateRange } from './filterContactsByDateRange'
import { groupContactsByStartDate } from './groupContactsByStartDate'
import { filterContactsByContactType } from './filterContactsByContactType'

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
  filters: ObjectMap<string | string[]>
}) => {
  const filteredBySystemGenerated = filterSystemGenerated({
    contacts: caseSummary.contactSummary,
    showSystemGenerated: filters.showSystemGenerated as string,
  })
  const {
    errors,
    contacts: contactsFilteredByDateRange,
    selected: selectedDateRange,
  } = filterContactsByDateRange({
    contacts: filteredBySystemGenerated,
    filters: filters as ObjectMap<string>,
  })
  const {
    contacts: contactsFilteredByContactTypes,
    selected: selectedContactTypes,
    contactTypes: allContactTypes,
  } = filterContactsByContactType({
    contacts: contactsFilteredByDateRange,
    filters,
  })
  const hasActiveFilters = Boolean(selectedDateRange || selectedContactTypes?.length)
  return {
    errors,
    data: {
      ...caseSummary,
      contactSummary: groupContactsByStartDate(contactsFilteredByContactTypes),
      contactCount: contactsFilteredByContactTypes.length,
      hasActiveFilters,
      filters: {
        dateRange: {
          selected: selectedDateRange,
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
        contactTypes: {
          allContactTypes,
          selected: selectedContactTypes,
          selectedIds: filters.contactTypes,
        },
      },
    },
  }
}
