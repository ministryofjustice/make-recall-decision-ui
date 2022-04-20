import { formatDateFromIsoString } from './index'

describe('formatDateFromIsoString', () => {
  it('formats a valid ISO date', () => {
    const formatted = formatDateFromIsoString('2022-03-04')
    expect(formatted).toEqual('4 Mar 2022')
  })

  it('in case of error, returns the supplied string', () => {
    const formatted = formatDateFromIsoString('22-1-5')
    expect(formatted).toEqual('22-1-5')
  })
})
