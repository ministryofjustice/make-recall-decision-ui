import { ContactHistoryResponse } from '../../../@types/make-recall-decision-api/models/ContactHistoryResponse'
import { filterContactsByDateRange } from './filterContactsByDateRange'
import { groupContactsByStartDate } from './groupContactsByStartDate'
import { filterContactsByContactType } from './filterContactsByContactType'
import { filterContactsBySearch } from './filterContactsBySearch'
import { removeFutureContacts } from './removeFutureContacts'
import { ContactHistoryFilters } from '../../../@types/contacts'
import { filterContactsBySystemGenerated } from './filterContactsBySystemGenerated'

export const transformContactHistory = ({
  caseSummary,
  filters,
}: {
  caseSummary: ContactHistoryResponse
  filters: ContactHistoryFilters
}) => {
  const { contacts: contactsFilteredBySystemGenerated, selected: selectedSystemGenerated } =
    filterContactsBySystemGenerated({
      contacts: caseSummary.contactSummary,
      filters,
    })
  // TODO - api should not return future contacts
  const pastContacts = removeFutureContacts(contactsFilteredBySystemGenerated)
  const {
    errors: errorsDateRange,
    contacts: contactsFilteredByDateRange,
    selected: selectedDateRange,
  } = filterContactsByDateRange({
    contacts: pastContacts,
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
    selectedIds,
  } = filterContactsByContactType({
    filteredContacts: contactsFilteredBySearch,
    allContacts: contactsFilteredBySystemGenerated,
    contactTypeGroups: caseSummary.contactTypeGroups,
    filters,
  })
  const hasActiveFilters = Boolean(
    selectedDateRange || selectedContactTypes?.length || selectedSearch || selectedSystemGenerated
  )
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
        includeSystemGenerated: {
          selected: selectedSystemGenerated,
          value: filters.includeSystemGenerated,
        },
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
          selectedIds,
        },
        searchFilters: {
          selected: selectedSearch,
          value: filters.searchFilters,
        },
      },
    },
  }
}
