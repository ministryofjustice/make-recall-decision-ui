import { formatDateRange, formatDateTimeFromIsoString, formatJSDate, formatSentenceLength } from './formatting'

describe('formatDateTimeFromIsoString', () => {
  it('formats a date', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-11-12' })
    expect(formatted).toEqual('12 November 2021')
  })

  it('formats a date in short format', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-11-12', shortDate: true })
    expect(formatted).toEqual('12 Nov 2021')
  })

  it('formats a date-time, adjusted if inside daylight saving', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-06-22T08:43:00.000Z' })
    expect(formatted).toEqual('22 June 2021 at 09:43')
  })

  it('formats a date-time, not adjusted if outside daylight saving', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T08:43:00.000Z' })
    expect(formatted).toEqual('22 December 2021 at 08:43')
  })

  it('formats a date-time as a date if dateOnly param is true', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T08:43:00.000Z', dateOnly: true })
    expect(formatted).toEqual('22 December 2021')
  })

  it('formats a date-only as a date even if dateOnly param is true', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22', dateOnly: true })
    expect(formatted).toEqual('22 December 2021')
  })

  it('formats a date-time as a time if timeOnly param is true', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T08:43:00.000Z', timeOnly: true })
    expect(formatted).toEqual('08:43')
  })

  it('formats a date-time as 24-hour time if timeOnly param is true', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T19:43:00.000Z', timeOnly: true })
    expect(formatted).toEqual('19:43')
  })

  it('in case of error, returns the supplied string', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '22-1-5' })
    expect(formatted).toEqual('22-1-5')
  })

  it('formats a date as month and year if monthAndYear param is true', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T19:43:00.000Z', monthAndYear: true })
    expect(formatted).toEqual('December 2021')
  })
})

describe('formatDateRange', () => {
  it('formats a date range', () => {
    const formatted = formatDateRange({
      dateFromIso: '2021-02-10T00:00:00.000Z',
      dateToIso: '2021-12-05T00:00:00.000Z',
    })
    expect(formatted).toEqual('10 Feb 2021 to 5 Dec 2021')
  })

  it('adjusts for DST', () => {
    const formatted = formatDateRange({
      dateFromIso: '2021-05-22T19:43:00.000Z',
      dateToIso: '2021-07-22T23:43:00.000Z',
    })
    expect(formatted).toEqual('22 May 2021 to 23 Jul 2021')
  })
})

describe('formatJSDate', () => {
  it('returns empty string when input is null', () => {
    expect(formatJSDate(null as unknown as string)).toBe('')
  })

  it('returns empty string when input is undefined', () => {
    expect(formatJSDate(undefined as unknown as string)).toBe('')
  })

  it('formats a valid Date object correctly', () => {
    const date = new Date(2025, 0, 15) // 15 Jan 2025 (month is 0-indexed)
    expect(formatJSDate(date)).toBe('15 January 2025')
  })

  it('formats a valid ISO string correctly', () => {
    expect(formatJSDate('2025-06-30')).toBe('30 June 2025')
  })

  it('formats a full datetime string correctly (ignores time)', () => {
    expect(formatJSDate('2025-12-25T10:30:00Z')).toBe('25 December 2025')
  })

  it('returns "Invalid Date" for invalid string', () => {
    expect(formatJSDate('not-a-date')).toBe('Invalid Date')
  })

  it('returns "Invalid Date" for an invalid Date object', () => {
    expect(formatJSDate(new Date('not-a-date'))).toBe('Invalid Date')
  })
})

describe('formatSentenceLength', () => {
  it('returns em dash if all parts are 0', () => {
    expect(formatSentenceLength({ partYears: 0, partMonths: 0, partDays: 0 })).toBe('—')
  })

  it('formats only years', () => {
    expect(formatSentenceLength({ partYears: 2, partMonths: 0, partDays: 0 })).toBe('2 years')
  })

  it('formats only months', () => {
    expect(formatSentenceLength({ partYears: 0, partMonths: 5, partDays: 0 })).toBe('5 months')
  })

  it('formats only days', () => {
    expect(formatSentenceLength({ partYears: 0, partMonths: 0, partDays: 1 })).toBe('1 day')
  })

  it('formats years, months, and days', () => {
    expect(formatSentenceLength({ partYears: 2, partMonths: 3, partDays: 4 })).toBe('2 years 3 months 4 days')
  })
})
