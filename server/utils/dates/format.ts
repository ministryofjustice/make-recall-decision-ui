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

export const formatDateTimeFromIsoString = ({ isoDate, dateOnly = false }: { isoDate: string; dateOnly?: boolean }) => {
  const dateAndTimePresentationFormat = `${dateFormat}' at '${timeFormat}`
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    const includeTime = isoDate.length > 10 && !dateOnly
    const dateTime = getDateTimeInEuropeLondon(isoDate)

    if (includeTime) {
      return dateTime.toFormat(dateAndTimePresentationFormat)
    }
    return dateTime.toFormat(dateFormat)
  } catch (err) {
    return isoDate
  }
}
