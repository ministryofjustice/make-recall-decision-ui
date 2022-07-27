import { DateTime, Settings } from 'luxon'
import { getProperty } from '../utils'
import { ValidationError } from '../../@types/dates'

Settings.throwOnInvalid = true
Settings.defaultZone = 'utc'

export const getDateProperty = <T>(obj: T, dateKey: string) => {
  const val = getProperty<T, string>(obj, dateKey)
  return val ? DateTime.fromISO(val) : undefined
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
  undefinedValuesLast = false,
}: {
  list: T[]
  dateKey: string
  newestFirst?: boolean
  undefinedValuesLast?: boolean
}): T[] => {
  if (!Array.isArray(list)) {
    return undefined
  }
  return list.sort((a, b): number => {
    const dateA = getDateProperty(a, dateKey)
    const dateB = getDateProperty(b, dateKey)
    if (!dateA || !dateB) {
      if (dateA || dateB) {
        if (!dateA) {
          return undefinedValuesLast ? 1 : -1
        }
        return undefinedValuesLast ? -1 : 1
      }
      return 0
    }
    return diffDatesForSort(dateA, dateB, newestFirst)
  })
}

export const dateHasError = (field: string | ValidationError) => Boolean((field as ValidationError).errorId)

export const europeLondon = 'Europe/London'

export function getDateTimeUTC(isoDate: string) {
  return DateTime.fromISO(isoDate, { zone: 'utc' })
}

export function getDateTimeInEuropeLondon(isoDate: string) {
  return getDateTimeUTC(isoDate).setZone(europeLondon)
}
