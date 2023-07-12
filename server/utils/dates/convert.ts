import { DateTime } from 'luxon'
import { DatePartNames, DatePartsParsed, DateTimePart, ValidationError } from '../../@types/dates'

import { padWithZeroes } from './format'
import logger from '../../../logger'
import { areStringArraysTheSame, isDefined, isEmptyStringOrWhitespace } from '../utils'
import { europeLondon, getDateTimeInEuropeLondon } from './index'

interface Options {
  includeTime?: boolean
  dateMustBeInPast?: boolean
  dateMustBeInFuture?: boolean
  validatePartLengths?: boolean
}

const filterPartsForEmptyStrings = (parts: unknown[]): DatePartNames[] =>
  parts.map(({ name, value }) => (isEmptyStringOrWhitespace(value) ? name : undefined)).filter(Boolean)

const filterPartsForMinimumLength = (parts: unknown[]): DatePartNames[] =>
  parts.map(({ name, value, minLength }) => (value.length < minLength ? name : undefined)).filter(Boolean)

const filterPartsForValueRange = (parts: unknown[]): DatePartNames[] =>
  parts
    .map(({ name, numberValue, minValue, maxValue }) =>
      numberValue < minValue || numberValue > maxValue ? name : undefined
    )
    .filter(Boolean)

const convertDatePartsToNumbers = (parts: DateTimePart[], options: Options) => {
  return parts.map(part => {
    let numberValue = parseInt(part.value, 10)
    if (part.name === 'year') {
      if (part.value.length === 2) {
        const currentYear = parseInt(DateTime.now().year.toString().substring(2), 10)
        if (options.dateMustBeInFuture || numberValue <= currentYear) {
          numberValue = 2000 + numberValue
        } else {
          numberValue = 1900 + numberValue
        }
      }
    }
    return { ...part, numberValue }
  })
}

export const MIN_VALUE_YEAR = 1900

export const convertGmtDatePartsToUtc = (
  { year, month, day, hour, minute }: Record<string, string | undefined>,
  options: Options = {}
): string | ValidationError => {
  if ([year, month, day, hour, minute].every(part => !isDefined(part) || part === '')) {
    return {
      errorId: 'blankDateTime',
      invalidParts: options.includeTime ? ['day', 'month', 'year', 'hour', 'minute'] : ['day', 'month', 'year'],
    }
  }
  let dateParts = [
    { name: 'day', value: day, minLength: 2, minValue: 1, maxValue: 31 },
    { name: 'month', value: month, minLength: 2, minValue: 1, maxValue: 12 },
    { name: 'year', value: year, minLength: 4, minValue: 1900, maxValue: 2200 },
  ] as DateTimePart[]
  if (options.includeTime) {
    dateParts = [
      ...dateParts,
      { name: 'hour', value: hour, minValue: 0, maxValue: 23, minLength: 2 },
      { name: 'minute', value: minute, minValue: 0, maxValue: 59, minLength: 2 },
    ]
  }

  let dateTimePartErrors = filterPartsForEmptyStrings(dateParts)
  if (dateTimePartErrors.length) {
    if (areStringArraysTheSame(dateTimePartErrors, ['day', 'month', 'year'])) {
      return {
        errorId: 'missingDate',
      }
    }
    if (areStringArraysTheSame(dateTimePartErrors, ['hour', 'minute'])) {
      return {
        errorId: 'missingTime',
        invalidParts: ['hour', 'minute'],
      }
    }
    return {
      errorId: 'missingDateParts',
      invalidParts: dateTimePartErrors,
    }
  }
  if (options.validatePartLengths) {
    dateTimePartErrors = filterPartsForMinimumLength(dateParts)
    if (dateTimePartErrors.length) {
      return {
        errorId: options.includeTime ? 'minLengthDateTimeParts' : 'minLengthDateParts',
        invalidParts: dateTimePartErrors,
      }
    }
  }

  dateParts = convertDatePartsToNumbers(dateParts, options)

  const [d, m, y, h, min] = dateParts.map(part => part.numberValue)

  if (y < MIN_VALUE_YEAR) {
    return {
      errorId: 'minValueDateYear',
    }
  }
  dateTimePartErrors = filterPartsForValueRange(dateParts)
  if (dateTimePartErrors.length) {
    return {
      errorId: 'outOfRangeValueDateParts',
      invalidParts: dateTimePartErrors,
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
  if (!isoDate) {
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
