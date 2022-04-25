import convertToTitleCase, { makePageTitle, listToString } from './utils'

describe('Convert to title case', () => {
  it('null string', () => {
    expect(convertToTitleCase(null)).toEqual('')
  })
  it('empty string', () => {
    expect(convertToTitleCase('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(convertToTitleCase('robert')).toEqual('Robert')
  })
  it('Upper Case', () => {
    expect(convertToTitleCase('ROBERT')).toEqual('Robert')
  })
  it('Mixed Case', () => {
    expect(convertToTitleCase('RoBErT')).toEqual('Robert')
  })
  it('Multiple words', () => {
    expect(convertToTitleCase('RobeRT SMiTH')).toEqual('Robert Smith')
  })
  it('Leading spaces', () => {
    expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(convertToTitleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
  })
})

describe('makePageTitle', () => {
  it('suffixes the supplied heading with the app name', () => {
    const title = makePageTitle('Search', false)
    expect(title).toEqual('Search - Recall Decisions')
  })

  it('prefixes the title if there are errors', () => {
    const title = makePageTitle('Search', true)
    expect(title).toEqual('Error: Search - Recall Decisions')
  })
})

describe('listToString', () => {
  it('returns a list for 1 item', () => {
    expect(listToString(['day'], 'and')).toEqual('day')
  })

  it('uses the supplied conjunction', () => {
    expect(listToString(['JPG', 'JPEG'], 'or')).toEqual('JPG or JPEG')
  })

  it('returns a list for 2 items', () => {
    expect(listToString(['year', 'day'], 'and')).toEqual('year and day')
  })

  it('returns a list for 3 items', () => {
    expect(listToString(['year', 'month', 'day'], 'and')).toEqual('year, month and day')
  })

  it('returns a list for 4 items', () => {
    expect(listToString(['year', 'month', 'day', 'minute'], 'and')).toEqual('year, month, day and minute')
  })

  it('accepts empty string as the conjunction', () => {
    expect(listToString(['5 Andrew Crescent', 'Southampton', 'S1 8EY'], '')).toEqual(
      '5 Andrew Crescent, Southampton S1 8EY'
    )
  })

  it('returns a list when no conjunction supplied', () => {
    expect(listToString(['year', 'month', 'day', 'minute'])).toEqual('year, month, day, minute')
  })
})
