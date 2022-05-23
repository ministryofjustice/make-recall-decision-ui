import { DateTime } from 'luxon'
import { DatePartNames, DatePartsParsed, DateTimePart, ValidationError } from '../../@types/dates'
import { ObjectMap } from '../../@types'
import { padWithZeroes } from './format'
import logger from '../../../logger'
import { areStringArraysTheSame, isDefined } from '../utils'
import { europeLondon, getDateTimeInEuropeLondon } from './index'

interface Options {
  includeTime?: boolean
  dateMustBeInPast?: boolean
  dateMustBeInFuture?: boolean
  validatePartLengths?: boolean
}

const filterPartsForEmptyStrings = (parts: unknown[]): DatePartNames[] =>
  parts.map(({ name, value }) => (value === '' ? name : undefined)).filter(Boolean)

const filterPartsForMinimumLength = (parts: unknown[]): DatePartNames[] =>
  parts.map(({ name, value, minLength }) => (value.length < (minLength || 2) ? name : undefined)).filter(Boolean)

export const MIN_VALUE_YEAR = 1900

export const convertGmtDatePartsToUtc = (
  { year, month, day, hour, minute }: ObjectMap<string | undefined>,
  options: Options = {}
): string | ValidationError => {
  if ([year, month, day, hour, minute].every(part => !isDefined(part) || part === '')) {
    return {
      errorId: 'blankDateTime',
    }
  }
  const dateParts = [
    { name: 'day', value: day },
    { name: 'month', value: month },
    { name: 'year', value: year, minLength: 4 },
  ]
  let timeParts = [] as DateTimePart[]
  if (options.includeTime) {
    timeParts = [
      { name: 'hour', value: hour },
      { name: 'minute', value: minute },
    ]
    let dateTimePartErrors = filterPartsForEmptyStrings([...dateParts, ...timeParts])
    if (dateTimePartErrors.length) {
      if (areStringArraysTheSame(dateTimePartErrors, ['day', 'month', 'year'])) {
        return {
          errorId: 'missingDate',
        }
      }
      if (areStringArraysTheSame(dateTimePartErrors, ['hour', 'minute'])) {
        return {
          errorId: 'missingTime',
        }
      }
      return {
        errorId: 'missingDateParts',
        invalidParts: dateTimePartErrors,
      }
    }
    if (options.validatePartLengths) {
      dateTimePartErrors = filterPartsForMinimumLength([...dateParts, ...timeParts])
      if (dateTimePartErrors.length) {
        return {
          errorId: 'minLengthDateTimeParts',
          invalidParts: dateTimePartErrors,
        }
      }
    }
  }
  let datePartErrors = filterPartsForEmptyStrings(dateParts)
  if (datePartErrors.length) {
    return {
      errorId: 'missingDateParts',
      invalidParts: datePartErrors,
    }
  }

  if (options.validatePartLengths) {
    datePartErrors = filterPartsForMinimumLength(dateParts)
    if (datePartErrors.length) {
      return {
        errorId: 'minLengthDateParts',
        invalidParts: datePartErrors,
      }
    }
  }

  const [d, m, y, h, min] = [...dateParts, ...timeParts].map(({ value }) => {
    return parseInt(value, 10)
  })
  if (y < MIN_VALUE_YEAR) {
    return {
      errorId: 'minValueDateYear',
    }
  }
  try {
    DateTime.fromObject(
      {
        year: y,
        month: m,
        day: d,
      },
      { zone: europeLondon }
    )
  } catch (err) {
    return { errorId: 'invalidDate' }
  }
  if (options.includeTime) {
    try {
      DateTime.fromObject(
        {
          hour: h,
          minute: min,
        },
        { zone: europeLondon }
      )
    } catch (err) {
      return { errorId: 'invalidTime' }
    }
  }
  const date = DateTime.fromObject(
    {
      year: y,
      month: m,
      day: d,
      hour: h,
      minute: min,
    },
    { zone: europeLondon }
  )
  if (options) {
    const now = DateTime.now()
    if (options.dateMustBeInPast === true && now < date) {
      return { errorId: 'dateMustBeInPast' }
    }
    if (options.dateMustBeInFuture === true && now > date) {
      return { errorId: 'dateMustBeInFuture' }
    }
  }
  if (options.includeTime) {
    return date.setZone('utc').toString()
  }
  return date.toISODate()
}

export const splitIsoDateToParts = (isoDate?: string): DatePartsParsed | undefined => {
  if (!isDefined(isoDate)) {
    return undefined
  }
  try {
    const includeTime = isoDate.length > 10
    const dateTime = getDateTimeInEuropeLondon(isoDate)
    const { year, month, day, hour, minute } = dateTime.toObject()
    const paddedDate = { year: year.toString(), month: padWithZeroes(month), day: padWithZeroes(day) }
    if (includeTime) {
      return { ...paddedDate, hour: padWithZeroes(hour), minute: padWithZeroes(minute) }
    }
    return paddedDate
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export const dateHasError = (field: string | ValidationError) => Boolean((field as ValidationError).errorId)

export const moveDateToEndOfDay = (isoDate: string) => {
  return DateTime.fromISO(isoDate).endOf('day').toISO()
}
