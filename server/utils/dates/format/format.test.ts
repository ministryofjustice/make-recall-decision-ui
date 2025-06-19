import { formatDateRange, formatDateTimeFromIsoString } from './format'

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
