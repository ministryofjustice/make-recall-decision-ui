import { DateTime, Interval } from 'luxon'
import { NamedFormError, ObjectMap } from '../../../@types'
import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc, moveDateToEndOfDay } from '../../../utils/dates/convert'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { dateHasError } from '../../../utils/dates'
import { formatValidationErrorMessage, makeErrorObject } from '../../../utils/errors'

const parseDateParts = ({
  fieldPrefix,
  filters,
}: {
  fieldPrefix: string
  filters: ObjectMap<string>
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
  filters: ObjectMap<string>
}): { errors?: NamedFormError[]; contacts: ContactSummaryResponse[]; selectedLabel?: string } => {
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
          id: 'dateFrom-day',
          text: formatValidationErrorMessage(dateFromIso as ValidationError, 'from date'),
        })
      )
    }
    if (dateHasError(dateToIso)) {
      errors.push(
        makeErrorObject({
          name: 'dateTo',
          id: 'dateTo-day',
          text: formatValidationErrorMessage(dateToIso as ValidationError, 'to date'),
        })
      )
    }
    return {
      errors,
      contacts,
    }
  }
  const dateFrom = DateTime.fromISO(dateFromIso as string)
  const dateTo = DateTime.fromISO(moveDateToEndOfDay(dateToIso as string))
  if (dateFrom.toMillis() > dateTo.toMillis()) {
    return {
      errors: [
        makeErrorObject({
          name: 'dateFrom',
          id: 'dateFrom-day',
          text: formatValidationErrorMessage({ errorId: 'fromDateAfterToDate' } as ValidationError),
        }),
      ],
      contacts,
    }
  }
  const interval = Interval.fromDateTimes(dateFrom, dateTo)
  return {
    contacts: contacts.filter(contact => interval.contains(DateTime.fromISO(contact.contactStartDate))),
    selectedLabel: `${dateFrom.toFormat('dd-MM-yyyy')} to ${dateTo.toFormat('dd-MM-yyyy')}`,
  }
}
