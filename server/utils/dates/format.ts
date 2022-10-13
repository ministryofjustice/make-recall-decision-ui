import { DateTime, Settings } from 'luxon'
import { isDefined, isNumber } from '../utils'
import { europeLondon, getDateTimeInEuropeLondon } from './index'

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
