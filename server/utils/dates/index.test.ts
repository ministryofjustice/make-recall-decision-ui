import { sortListByDateField } from './index'

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

  it('returns undefined if the list is undefined', () => {
    const result = sortListByDateField({ list: undefined, dateKey: 'date' })
    expect(result).toBeUndefined()
  })

  it('places undefined values at the end if param is true', () => {
    const list = [{ a: null }, { a: '2021-02-13' }, { a: undefined }, { a: '2022-02-11' }]
    const sorted = sortListByDateField({ list, dateKey: 'a', newestFirst: true, undefinedValuesLast: true })
    expect(sorted).toEqual([{ a: '2022-02-11' }, { a: '2021-02-13' }, { a: null }, { a: undefined }])
  })

  it('places undefined values at the start if param is false', () => {
    const list = [{ a: null }, { a: '2021-02-13' }, { a: undefined }, { a: '2022-02-11' }]
    const sorted = sortListByDateField({ list, dateKey: 'a', newestFirst: true, undefinedValuesLast: false })
    expect(sorted).toEqual([{ a: null }, { a: undefined }, { a: '2022-02-11' }, { a: '2021-02-13' }])
  })
})
