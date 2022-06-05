import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { ObjectMap } from '../../../@types'
import { filterContactsByDateRange } from './filterContactsByDateRange'
import { groupContactsByStartDate } from './groupContactsByStartDate'
import { filterContactsByContactType } from './filterContactsByContactType'
import { filterContactsBySearch } from './filterContactsSearch'

export const transformContactHistory = ({
  caseSummary,
  filters,
}: {
  caseSummary: LicenceHistoryResponse
  filters: ObjectMap<string | string[]>
}) => {
  const {
    errors: errorsDateRange,
    contacts: contactsFilteredByDateRange,
    selected: selectedDateRange,
  } = filterContactsByDateRange({
    contacts: caseSummary.contactSummary,
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
  const {
    errors: errorsSearchFilter,
    contacts: contactsFilteredBySearch,
    selected: selectedSearch,
  } = filterContactsBySearch({
    contacts: contactsFilteredByContactTypes,
    filters,
  })
  const hasActiveFilters = Boolean(selectedDateRange || selectedContactTypes?.length || selectedSearch)
  const combinedErrors =
    errorsDateRange || errorsSearchFilter ? [...(errorsDateRange || []), ...(errorsSearchFilter || [])] : undefined
  return {
    errors: combinedErrors,
    data: {
      ...caseSummary,
      contactSummary: groupContactsByStartDate(contactsFilteredBySearch),
      contactCount: contactsFilteredBySearch.length,
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
        searchFilter: {
          selected: selectedSearch,
          value: filters.searchFilter,
        },
      },
    },
  }
}
