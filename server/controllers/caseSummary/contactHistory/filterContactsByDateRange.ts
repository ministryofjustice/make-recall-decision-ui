import { DateTime, Interval } from 'luxon'

import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc } from '../../../utils/dates/convert'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { dateHasError, europeLondon } from '../../../utils/dates'
import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { formatDateRange } from '../../../utils/dates/format'
import { removeParamsFromQueryString } from '../../../utils/utils'
import { ContactHistoryFilters } from '../../../@types/contacts'
import { NamedFormError } from '../../../@types/pagesForms'

const parseDateParts = ({
  fieldPrefix,
  filters,
}: {
  fieldPrefix: string
  filters: ContactHistoryFilters
}): string | ValidationError => {
  const dateTimeParts = {
    day: filters[`${fieldPrefix}-day`],
    month: filters[`${fieldPrefix}-month`],
    year: filters[`${fieldPrefix}-year`],
  }
  return convertGmtDatePartsToUtc(dateTimeParts, {
    includeTime: false,
    dateMustBeInPast: true,
    validatePartLengths: false,
  })
}

export const filterContactsByDateRange = ({
  contacts,
  filters,
}: {
  contacts: ContactSummaryResponse[]
  filters: ContactHistoryFilters
}): {
  errors?: NamedFormError[]
  contacts: ContactSummaryResponse[]
  selected?: { text: string; href: string }[]
} => {
  const dateFromIso = parseDateParts({ fieldPrefix: 'dateFrom', filters })
  const dateToIso = parseDateParts({ fieldPrefix: 'dateTo', filters })
  const dateFromIsBlank = dateHasError(dateFromIso) && (dateFromIso as ValidationError).errorId === 'blankDateTime'
  const dateToIsBlank = dateHasError(dateToIso) && (dateToIso as ValidationError).errorId === 'blankDateTime'

  // if both dates are blank, don't show an error, just return the unfiltered contacts
  if (dateFromIsBlank && dateToIsBlank) {
    return { contacts }
  }
  // other errors
  if (dateHasError(dateFromIso) || dateHasError(dateToIso)) {
    const errors = []
    if (dateHasError(dateFromIso)) {
      errors.push(
        makeErrorObject({
          name: 'dateFrom',
          id: invalidDateInputPart(dateFromIso as ValidationError, 'dateFrom'),
          text: formatValidationErrorMessage(dateFromIso as ValidationError, 'from date'),
          errorId: (dateFromIso as ValidationError).errorId,
        })
      )
    }
    if (dateHasError(dateToIso)) {
      errors.push(
        makeErrorObject({
          name: 'dateTo',
          id: invalidDateInputPart(dateToIso as ValidationError, 'dateTo'),
          text: formatValidationErrorMessage(dateToIso as ValidationError, 'to date'),
          errorId: (dateToIso as ValidationError).errorId,
        })
      )
    }
    return {
      errors,
      contacts,
    }
  }
  const dateFrom = DateTime.fromISO(dateFromIso as string, { zone: europeLondon })
  const dateTo = DateTime.fromISO(dateToIso as string, { zone: europeLondon }).endOf('day')
  if (dateFrom.toMillis() > dateTo.toMillis()) {
    return {
      errors: [
        makeErrorObject({
          name: 'dateFrom',
          id: 'dateFrom-day',
          text: formatValidationErrorMessage({ errorId: 'fromDateAfterToDate' } as ValidationError),
          errorId: 'fromDateAfterToDate',
        }),
      ],
      contacts,
    }
  }
  const interval = Interval.fromDateTimes(dateFrom, dateTo)
  const filteredByDateRange = contacts.filter(contact => {
    const contactStartDate = DateTime.fromISO(contact.contactStartDate)
    return interval.contains(contactStartDate)
  })
  const selectedFilterTags = [
    {
      href: removeParamsFromQueryString({
        paramsToRemove: [
          { key: 'dateFrom-day' },
          { key: 'dateFrom-month' },
          { key: 'dateFrom-year' },
          { key: 'dateTo-day' },
          { key: 'dateTo-month' },
          { key: 'dateTo-year' },
        ],
        allParams: filters as unknown as Record<string, string | string[]>,
      }),
      text: formatDateRange({ dateFromIso: dateFromIso as string, dateToIso: dateToIso as string }),
    },
  ]
  return {
    contacts: filteredByDateRange,
    selected: selectedFilterTags,
  }
}
