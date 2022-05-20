import { Settings } from 'luxon'
import { isDefined, isNumber } from '../utils'
import { getDateTimeInEuropeLondon } from './index'

Settings.throwOnInvalid = true

const dateFormat = 'd MMMM yyyy'
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
}: {
  isoDate: string
  dateOnly?: boolean
  timeOnly?: boolean
}) => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  const dateAndTimePresentationFormat = `${dateFormat}' at '${timeFormat}`
  try {
    const dateTime = getDateTimeInEuropeLondon(isoDate)

    // date only
    if (dateOnly || isoDate.length === 10) {
      return dateTime.toFormat(dateFormat)
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
