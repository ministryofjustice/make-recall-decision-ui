import { isObjectInArray, selectedFilterItems } from './nunjucks'

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
