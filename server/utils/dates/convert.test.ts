import { DateTime } from 'luxon'
import { convertGmtDatePartsToUtc, moveDateToEndOfDay, splitIsoDateToParts } from './convert'
import { padWithZeroes } from './format'

describe('convertGmtDatePartsToUtc', () => {
  it('returns an ISO formatted UTC date for valid date-time parts that fall within BST period', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2021', month: '05', day: '30', hour: '14', minute: '12' },
      { includeTime: true }
    )
    expect(result).toEqual('2021-05-30T13:12:00.000Z')
  })

  it('returns an ISO formatted UTC date for valid date parts', () => {
    const result = convertGmtDatePartsToUtc({ year: '2021', month: '05', day: '30' })
    expect(result).toEqual('2021-05-30')
  })

  it('returns an ISO formatted UTC date for valid date-time parts that fall outside BST period', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2021', month: '01', day: '12', hour: '11', minute: '40' },
      { includeTime: true }
    )
    expect(result).toEqual('2021-01-12T11:40:00.000Z')
  })

  it('returns an ISO formatted UTC date-time for a valid date-time', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2021', month: '01', day: '12', hour: '10', minute: '53' },
      { includeTime: true }
    )
    expect(result).toEqual('2021-01-12T10:53:00.000Z')
  })

  it('returns an ISO formatted UTC date for a valid date', () => {
    const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12' })
    expect(result).toEqual('2021-01-12')
  })

  it('returns an error for a date with all parts missing', () => {
    const result = convertGmtDatePartsToUtc({ year: '', month: '', day: '' })
    expect(result).toEqual({ errorId: 'blankDateTime' })
  })

  it('returns an error for a date-time with all parts missing', () => {
    const result = convertGmtDatePartsToUtc({ year: '', month: '', day: '', hour: '', minute: '' })
    expect(result).toEqual({ errorId: 'blankDateTime' })
  })

  it('returns an error for a date with any part missing', () => {
    const result = convertGmtDatePartsToUtc({ year: '', month: '3', day: '20' })
    expect(result).toEqual({ errorId: 'missingDateParts', invalidParts: ['year'] })
  })

  it('returns an error for a date-time with any part not being an integer', () => {
    const result = convertGmtDatePartsToUtc(
      { year: 'ff21', month: '3.2', day: '-0.5', hour: 'ab1', minute: '-100' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'invalidDate' })
  })

  it('returns an error for a date with any part over the max allowed value', () => {
    const result = convertGmtDatePartsToUtc({ year: '2020', month: '32', day: '45' })
    expect(result).toEqual({ errorId: 'invalidDate' })
  })

  it('returns an error for a date with the year below the minimum value', () => {
    const result = convertGmtDatePartsToUtc({ year: '1899', month: '10', day: '12' })
    expect(result).toEqual({ errorId: 'minValueDateYear' })
  })

  it('returns undefined for a 29 Feb date not in a leap year', () => {
    const result = convertGmtDatePartsToUtc({ year: '2021', month: '02', day: '29' })
    expect(result).toEqual({ errorId: 'invalidDate' })
  })

  it('returns an ISO formatted UTC date for a 29 Feb date in a leap year', () => {
    const result = convertGmtDatePartsToUtc({ year: '2020', month: '02', day: '29' })
    expect(result).toEqual('2020-02-29')
  })

  it('returns an error for a date with any date part having a negative value', () => {
    const result = convertGmtDatePartsToUtc({ year: '2020', month: '-5', day: '12' })
    expect(result).toEqual({ errorId: 'invalidDate' })
  })

  it('returns an error for a date-time with any hour part having a negative value', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2020', month: '05', day: '12', hour: '-10', minute: '53' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'invalidTime' })
  })

  it('returns an error for a date-time with any hour part over the max allowed value', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2020', month: '05', day: '12', hour: '24', minute: '53' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'invalidTime' })
  })

  it('returns an error for a date-time with any minute part having a negative value', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2020', month: '05', day: '12', hour: '-10', minute: '53' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'invalidTime' })
  })

  it('returns an error for a date-time with any minute part having a value out of bounds', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2020', month: '05', day: '12', hour: '23', minute: '60' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'invalidTime' })
  })

  it('returns an error for a date-time with parts missing from date and time', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '', month: '03', day: '20', hour: '', minute: '05' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'missingDateParts', invalidParts: ['year', 'hour'] })
  })

  it('returns an error for a date with any parts missing', () => {
    const result = convertGmtDatePartsToUtc({ year: '2021', month: '', day: '' })
    expect(result).toEqual({ errorId: 'missingDateParts', invalidParts: ['day', 'month'] })
  })

  it('returns an error for a date-time with all date parts missing', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '', month: '', day: '', hour: '03', minute: '04' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'missingDate' })
  })

  it('returns an error for a date-time with any time parts missing', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2021', month: '03', day: '25', hour: '05', minute: '' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'missingDateParts', invalidParts: ['minute'] })
  })

  it('returns an error for a date-time with all time parts missing', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2021', month: '03', day: '25', hour: '', minute: '' },
      { includeTime: true }
    )
    expect(result).toEqual({ errorId: 'missingTime' })
  })

  it('returns an error if a date-time must be in the past but is in the future', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2050', month: '12', day: '10', hour: '23', minute: '12' },
      { dateMustBeInPast: true, includeTime: true }
    )
    expect(result).toEqual({ errorId: 'dateMustBeInPast' })
  })

  it('returns an error if a date must be in the past but is in the future', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2045', month: '03', day: '04' },
      { dateMustBeInPast: true, includeTime: false }
    )
    expect(result).toEqual({ errorId: 'dateMustBeInPast' })
  })

  it('returns valid date string if a date must be in the past and is today', () => {
    const today = DateTime.now()
    const { year, month, day } = today
    const result = convertGmtDatePartsToUtc(
      { year: year.toString(), month: padWithZeroes(month), day: padWithZeroes(day) },
      { dateMustBeInPast: true, includeTime: false }
    )
    expect(result).toEqual(today.toISODate())
  })

  it('returns an error if a date-time must be in the future but is in the past', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2020', month: '12', day: '10', hour: '23', minute: '12' },
      { dateMustBeInFuture: true, includeTime: true }
    )
    expect(result).toEqual({ errorId: 'dateMustBeInFuture' })
  })

  it('returns an error if a date must be in the future but is in the past', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2020', month: '03', day: '04' },
      { dateMustBeInFuture: true, includeTime: false }
    )
    expect(result).toEqual({ errorId: 'dateMustBeInFuture' })
  })

  it('allows single-digit parts if validatePartLengths option is not passed', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2021', month: '3', day: '5', hour: '5', minute: '1' },
      { includeTime: true }
    )
    expect(result).toEqual('2021-03-05T05:01:00.000Z')
  })

  it('returns an error for a date-time with any single-digit parts not padded with zeroes, if validatePartLengths option is passed', () => {
    const result = convertGmtDatePartsToUtc(
      { year: '2021', month: '3', day: '5', hour: '5', minute: '1' },
      { includeTime: true, validatePartLengths: true }
    )
    expect(result).toEqual({ errorId: 'minLengthDateTimeParts', invalidParts: ['day', 'month', 'hour', 'minute'] })
  })

  it('returns an error for a date with any single-digit parts not padded with zeroes, if validatePartLengths option is passed', () => {
    const result = convertGmtDatePartsToUtc({ year: '2021', month: '3', day: '5' }, { validatePartLengths: true })
    expect(result).toEqual({ errorId: 'minLengthDateParts', invalidParts: ['day', 'month'] })
  })

  it('returns an error for a year of less than 4 digits, if validatePartLengths option is passed', () => {
    const result = convertGmtDatePartsToUtc({ year: '21', month: '03', day: '05' }, { validatePartLengths: true })
    expect(result).toEqual({ errorId: 'minLengthDateParts', invalidParts: ['year'] })
  })
})

describe('splitIsoDateToParts', () => {
  it('returns date parts for a given ISO date-time string, with hours corrected if inside DST', () => {
    const result = splitIsoDateToParts('2021-05-30T13:12:00.000Z')
    expect(result).toEqual({
      day: '30',
      hour: '14',
      minute: '12',
      month: '05',
      year: '2021',
    })
  })

  it('returns date parts for a given ISO date-time string, with hours not corrected if outside DST', () => {
    const result = splitIsoDateToParts('2021-11-12T08:43:00.000Z')
    expect(result).toEqual({
      day: '12',
      hour: '08',
      minute: '43',
      month: '11',
      year: '2021',
    })
  })

  it('returns date parts for a given ISO date string', () => {
    const result = splitIsoDateToParts('2021-05-30')
    expect(result).toEqual({
      day: '30',
      month: '05',
      year: '2021',
    })
  })

  it('returns undefined if passed an empty date string', () => {
    const result = splitIsoDateToParts()
    expect(result).toBeUndefined()
  })
})

describe('moveDateToEndOfDay', () => {
  it('sets the timestamp for a date to 23:59', () => {
    const result = moveDateToEndOfDay('2022-10-05')
    expect(result).toEqual('2022-10-05T23:59:59.999Z')
  })

  it('adjusts an existing timestamp to 23:59', () => {
    const result = moveDateToEndOfDay('2022-10-05T08:43:29.000Z')
    expect(result).toEqual('2022-10-05T23:59:59.999Z')
  })
})
