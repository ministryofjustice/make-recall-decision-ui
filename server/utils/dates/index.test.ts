import { formatDateFromIsoString, sortListByDateField } from './index'

describe('formatDateFromIsoString', () => {
  it('formats a valid ISO date', () => {
    const formatted = formatDateFromIsoString('2022-03-04')
    expect(formatted).toEqual('4 March 2022')
  })

  it('in case of error, returns the supplied string', () => {
    const formatted = formatDateFromIsoString('22-1-5')
    expect(formatted).toEqual('22-1-5')
  })
})

describe('sortListByDateField', () => {
  it('sorts by a deeply nested key, oldest first', () => {
    const list = [{ a: { b: { c: '2021-10-03' } } }, { a: { b: { c: '2021-10-02' } } }]
    const sorted = sortListByDateField({ list, dateKey: 'a.b.c', newestFirst: false })
    expect(sorted).toEqual([{ a: { b: { c: '2021-10-02' } } }, { a: { b: { c: '2021-10-03' } } }])
  })

  it('sorts by a deeply nested key, newest first', () => {
    const list = [
      { a: { b: { c: '2021-02-13' } } },
      { a: { b: { c: '2021-08-22' } } },
      { a: { b: { c: '2022-02-11' } } },
    ]
    const sorted = sortListByDateField({ list, dateKey: 'a.b.c', newestFirst: true })
    expect(sorted).toEqual([
      { a: { b: { c: '2022-02-11' } } },
      { a: { b: { c: '2021-08-22' } } },
      { a: { b: { c: '2021-02-13' } } },
    ])
  })
})
