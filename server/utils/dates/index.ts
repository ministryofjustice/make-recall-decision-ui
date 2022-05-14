import { DateTime, Settings } from 'luxon'
import { getProperty } from '../utils'

const formattedDateShortMonth = 'd MMMM yyyy'

Settings.throwOnInvalid = true

export const formatDateFromIsoString = (isoDate: string) => {
  try {
    return DateTime.fromISO(isoDate, { zone: 'utc' }).toFormat(formattedDateShortMonth)
  } catch (err) {
    return isoDate
  }
}

export const getDateProperty = <T>(obj: T, dateKey: string) => {
  const val = getProperty<T, string>(obj, dateKey)
  return val ? DateTime.fromISO(val, { zone: 'utc' }) : undefined
}

export const diffDatesForSort = (dateA: DateTime, dateB: DateTime, newestFirst = true) => {
  if (!dateA || !dateB) {
    return 0
  }
  const diff = dateB.diff(dateA).toMillis()
  if (diff > 0) {
    return newestFirst ? 1 : -1
  }
  if (diff < 0) {
    return newestFirst ? -1 : 1
  }
  return 0
}

export const sortListByDateField = <T>({
  list,
  dateKey,
  newestFirst = true,
}: {
  list: T[]
  dateKey: string
  newestFirst?: boolean
}): T[] => {
  return list.sort((a, b): number => {
    const dateA = getDateProperty(a, dateKey)
    const dateB = getDateProperty(b, dateKey)
    if (!dateA || !dateB) {
      return 0
    }
    return diffDatesForSort(dateA, dateB, newestFirst)
  })
}
