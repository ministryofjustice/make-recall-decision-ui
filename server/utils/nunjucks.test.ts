import { isObjectInArray, merge, selectedFilterItems } from './nunjucks'

describe('selectedFilterItems', () => {
  it('prefixes hrefs with the URL path', () => {
    const result = selectedFilterItems({
      items: [
        { href: '', text: 'Test' },
        { href: '?contactTypes=BFI', text: 'Test 2' },
      ],
      urlInfo: {
        path: '/contact-history',
      },
    })
    expect(result).toEqual([
      {
        href: '/contact-history',
        text: 'Test',
      },
      {
        href: '/contact-history?contactTypes=BFI',
        text: 'Test 2',
      },
    ])
  })
})

describe('isObjectInArray', () => {
  it('returns true if an object with all the properties is found', () => {
    const result = isObjectInArray({
      properties: { mainCatCode: 'NLC5', subCatCode: 'NST14' },
      arr: [
        { mainCatCode: 'NLC5', subCatCode: 'NST14' },
        { mainCatCode: 'ABC', subCatCode: 'DEF' },
      ],
    })
    expect(result).toEqual(true)
  })

  it('returns true if an object with the property is found', () => {
    const result = isObjectInArray({
      properties: { mainCatCode: 'NLC5' },
      arr: [
        { mainCatCode: 'NLC5', subCatCode: 'NST14' },
        { mainCatCode: 'ABC', subCatCode: 'DEF' },
      ],
    })
    expect(result).toEqual(true)
  })

  it('returns false if not all the properties are matched', () => {
    const result = isObjectInArray({
      properties: { mainCatCode: 'ONE', subCatCode: 'NST14' },
      arr: [
        { mainCatCode: 'NLC5', subCatCode: 'NST14' },
        { mainCatCode: 'ABC', subCatCode: 'DEF' },
      ],
    })
    expect(result).toEqual(false)
  })
})

describe('merge', () => {
  it('merges two objects', () => {
    const result = merge({ a: 1 }, { b: 'abc' })
    expect(result).toEqual({ a: 1, b: 'abc' })
  })

  it('merges more than two objects', () => {
    const result = merge({ a: 1, b: 2, c: 'three' }, { d: 'four', e: 5 }, { f: 'six' })
    expect(result).toEqual({ a: 1, b: 2, c: 'three', d: 'four', e: 5, f: 'six' })
  })

  it('later objects overwrite earlier ones', () => {
    const result = merge({ a: 1, b: 2 }, { b: 'overwritten', c: 3 })
    expect(result).toEqual({ a: 1, b: 'overwritten', c: 3 })
  })

  it('does not mutate the original object(s)', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { b: 'overwritten', c: 3 }
    const result = merge(obj1, obj2)
    expect(obj1).toEqual({ a: 1, b: 2 })
    expect(obj2).toEqual({ b: 'overwritten', c: 3 })
    expect(result).toEqual({ a: 1, b: 'overwritten', c: 3 })
  })
})
