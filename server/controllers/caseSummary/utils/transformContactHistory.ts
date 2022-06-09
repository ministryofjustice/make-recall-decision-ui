import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { ObjectMap } from '../../../@types'
import { filterContactsByDateRange } from './filterContactsByDateRange'
import { groupContactsByStartDate } from './groupContactsByStartDate'
import { filterContactsByContactType } from './filterContactsByContactType'
import { filterContactsBySearch } from './filterContactsBySearch'

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
    contactTypes: allContactTypes,
  } = filterContactsByContactType({
    contacts: contactsFilteredBySearch,
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
          allContactTypes,
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
