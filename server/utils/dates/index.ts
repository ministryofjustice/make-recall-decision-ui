import { DateTime, Settings } from 'luxon'

const formattedDateShortMonth = 'd MMM yyyy'

Settings.throwOnInvalid = true

export const formatDateFromIsoString = (isoDate: string) => {
  try {
    return DateTime.fromISO(isoDate, { zone: 'utc' }).toFormat(formattedDateShortMonth)
  } catch (err) {
    return isoDate
  }
}
