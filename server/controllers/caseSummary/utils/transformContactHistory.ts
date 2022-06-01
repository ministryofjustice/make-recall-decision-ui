import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { ObjectMap } from '../../../@types'
import { filterContactsByDateRange } from './filterContactsByDateRange'
import { groupContactsByStartDate } from './groupContactsByStartDate'
import { filterContactsByContactType } from './filterContactsByContactType'

export const transformContactHistory = ({
  caseSummary,
  filters,
}: {
  caseSummary: LicenceHistoryResponse
  filters: ObjectMap<string | string[]>
}) => {
  const {
    errors,
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
