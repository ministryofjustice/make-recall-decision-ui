import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { ContactHistoryFilters, ObjectMap } from '../../../@types'
import { filterContactsByDateRange } from './filterContactsByDateRange'
import { groupContactsByStartDate } from './groupContactsByStartDate'
import { filterContactsByContactType } from './filterContactsByContactType'
import { filterContactsBySearch } from './filterContactsBySearch'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'

const removeSystemGenerated = (contacts: ContactSummaryResponse[]): ContactSummaryResponse[] =>
  contacts.filter((contact: ContactSummaryResponse) => contact.systemGenerated === false)

export const transformContactHistory = ({
  caseSummary,
  filters,
  featureFlags,
}: {
  caseSummary: LicenceHistoryResponse
  filters: ContactHistoryFilters
  featureFlags: ObjectMap<boolean>
}) => {
  const allContacts = featureFlags.flagShowSystemGenerated
    ? caseSummary.contactSummary
    : removeSystemGenerated(caseSummary.contactSummary)
  const {
    errors: errorsDateRange,
    contacts: contactsFilteredByDateRange,
    selected: selectedDateRange,
  } = filterContactsByDateRange({
    contacts: allContacts,
    filters,
  })
  const {
    errors: errorsSearchFilter,
    contacts: contactsFilteredBySearch,
    selected: selectedSearch,
  } = filterContactsBySearch({
    contacts: contactsFilteredByDateRange,
    filters,
  })
  // the contact type filter should always happen last
  // because it will generate contact counts for each contact type, based on the remaining results
  // so no further filtering can happen after that
  const {
    contacts: contactsFilteredByContactTypes,
    selected: selectedContactTypes,
    contactTypeGroups,
  } = filterContactsByContactType({
    filteredContacts: contactsFilteredBySearch,
    allContacts,
    contactTypeGroups: caseSummary.contactTypeGroups,
    filters,
  })
  const hasActiveFilters = Boolean(selectedDateRange || selectedContactTypes?.length || selectedSearch)
  const combinedErrors =
    errorsDateRange || errorsSearchFilter ? [...(errorsDateRange || []), ...(errorsSearchFilter || [])] : undefined
  return {
    errors: combinedErrors,
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
          contactTypeGroups,
          selected: selectedContactTypes,
          selectedIds: filters.contactTypes,
        },
        searchFilters: {
          selected: selectedSearch,
          value: filters.searchFilters,
        },
      },
    },
  }
}
