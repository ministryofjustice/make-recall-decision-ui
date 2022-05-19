import { formatDateTimeFromIsoString } from './format'

describe('formatDateTimeFromIsoString', () => {
  it('formats a date', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '2021-11-12' })
    expect(formatted).toEqual('12 November 2021')
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

  it('in case of error, returns the supplied string', () => {
    const formatted = formatDateTimeFromIsoString({ isoDate: '22-1-5' })
    expect(formatted).toEqual('22-1-5')
  })
})
