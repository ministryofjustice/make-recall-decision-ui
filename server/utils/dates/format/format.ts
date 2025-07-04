import { DateTime, Settings } from 'luxon'
import { isDefined, isNumber } from '../../utils'
import { europeLondon, getDateTimeInEuropeLondon } from '../index'
import { Term } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'

Settings.throwOnInvalid = true
Settings.defaultZone = 'utc'

const dateFormat = 'd MMMM yyyy'
const dateFormatShortMonth = 'd MMM yyyy'
const dateFormatMonthAndYear = 'MMMM yyyy'
const timeFormat = 'HH:mm'

export const padWithZeroes = (value?: number): string => {
  if (!isNumber(value)) {
    return ''
  }
  const padded = value.toString()
  return padded.length < 2 ? `0${padded}` : padded
}

export const formatDateTimeFromIsoString = ({
  isoDate,
  dateOnly = false,
  timeOnly = false,
  monthAndYear = false,
  shortDate = false,
}: {
  isoDate: string
  dateOnly?: boolean
  timeOnly?: boolean
  monthAndYear?: boolean
  shortDate?: boolean
}) => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  const dateAndTimePresentationFormat = `${dateFormat}' at '${timeFormat}`
  try {
    const dateTime = getDateTimeInEuropeLondon(isoDate)

    // month and year only
    if (monthAndYear) {
      return dateTime.toFormat(dateFormatMonthAndYear)
    }
    // date only
    if (dateOnly || isoDate.length === 10) {
      return dateTime.toFormat(shortDate ? dateFormatShortMonth : dateFormat)
    }
    // time only
    if (timeOnly && isoDate.length > 10) {
      return dateTime.toFormat(timeFormat)
    }
    // date and time
    return dateTime.toFormat(dateAndTimePresentationFormat)
  } catch (err) {
    return isoDate
  }
}

export const formatDateRange = ({ dateFromIso, dateToIso }: { dateFromIso: string; dateToIso: string }) =>
  `${DateTime.fromISO(dateFromIso).setZone(europeLondon).toFormat(dateFormatShortMonth)} to ${DateTime.fromISO(
    dateToIso
  )
    .setZone(europeLondon)
    .toFormat(dateFormatShortMonth)}`

export const formatTerm = (term: Term) => {
  let latch = false
  let result = ''
  if (term.years) {
    result = `${result + term.years} years`
    latch = true
  }
  if (term.months) {
    if (latch) {
      result += ', '
    }
    result = `${result + term.months} months`
    latch = true
  }
  if (term.weeks) {
    if (latch) {
      result += ', '
    }
    result = `${result + term.weeks} weeks`
    latch = true
  }
  if (term.days) {
    if (latch) {
      result += ', '
    }
    result = `${result + term.days} days`
  }
  return result
}

export const pluralise = (text: string, numericValue: number): string => {
  return `${text}${numericValue > 1 ? 's' : ''}`
}
