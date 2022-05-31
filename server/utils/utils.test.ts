import convertToTitleCase, {
  makePageTitle,
  listToString,
  getProperty,
  groupListByValue,
  dedupeList,
  removeParamsFromQueryString,
} from './utils'

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
    const title = makePageTitle({ pageHeading: 'Search', hasErrors: false })
    expect(title).toEqual('Search - Recall Decisions')
  })

  it('prefixes the title if there are errors', () => {
    const title = makePageTitle({ pageHeading: 'Search', hasErrors: true })
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

describe('getProperty', () => {
  it('returns a nested property', () => {
    const obj = {
      legalRepresentativeInfo: {
        email: 'davey@crockett.com',
      },
    }
    const val = getProperty(obj, 'legalRepresentativeInfo.email')
    expect(val).toEqual('davey@crockett.com')
  })

  it('returns a top level property', () => {
    const obj = {
      legalRepresentativeInfo: 'blah',
    }
    const val = getProperty(obj, 'legalRepresentativeInfo')
    expect(val).toEqual('blah')
  })

  it("returns undefined for a nested property thtaa doesn't exist", () => {
    const obj = {
      legalRepresentativeInfo: {
        email: 'davey@crockett.com',
      },
    }
    const val = getProperty(obj, 'legalRepresentativeInfo.phone')
    expect(val).toBeUndefined()
  })
})

describe('groupListByValue', () => {
  it('groups by value', () => {
    const list = [
      {
        a: 1,
        b: 2,
        c: 3,
      },
      {
        a: 5,
        b: 3,
        c: 9,
      },
      {
        a: 5,
        b: 2,
        c: 9,
      },
    ]
    const grouped = groupListByValue<{ a: number; b: number; c: number }>({ list, groupByKey: 'b' })
    expect(grouped).toEqual({
      groupedByKey: 'b',
      items: [
        {
          groupValue: 2,
          items: [
            {
              a: 1,
              b: 2,
              c: 3,
            },
            {
              a: 5,
              b: 2,
              c: 9,
            },
          ],
        },
        {
          groupValue: 3,
          items: [
            {
              a: 5,
              b: 3,
              c: 9,
            },
          ],
        },
      ],
    })
  })
})

describe('dedupeList', () => {
  it('removes duplicates', () => {
    const result = dedupeList(['aa', 'bb', 'aa', 'c', 'ddd'])
    expect(result).toEqual(['aa', 'bb', 'c', 'ddd'])
  })
})

describe('removeParamsFromQueryString', () => {
  it('removes the specified params', () => {
    const queryString = removeParamsFromQueryString({
      paramsToRemove: [{ key: 'contactTypes', value: 'LVSP' }],
      allParams: {
        contactTypes: 'LVSP',
      },
    })
    expect(queryString).toEqual('')
  })

  it('leaves other params intact', () => {
    const queryString = removeParamsFromQueryString({
      paramsToRemove: [{ key: 'contactTypes', value: 'LVSP' }],
      allParams: {
        contactTypes: 'LVSP',
        'dateFrom-day': '1',
      },
    })
    expect(queryString).toEqual('?dateFrom-day=1')
  })

  it('removes the specified params if an array', () => {
    const queryString = removeParamsFromQueryString({
      paramsToRemove: [{ key: 'contactTypes', value: 'IVSP' }],
      allParams: {
        'dateFrom-day': '',
        'dateFrom-month': '',
        'dateFrom-year': '',
        'dateTo-day': '',
        'dateTo-month': '',
        'dateTo-year': '',
        contactTypes: ['IVSP', 'C191', 'ROC'],
      },
    })
    expect(queryString).toEqual('?contactTypes=C191&contactTypes=ROC')
  })

  it('removes multiple date params', () => {
    const queryString = removeParamsFromQueryString({
      paramsToRemove: [
        {
          key: 'dateFrom-day',
        },
        {
          key: 'dateFrom-month',
        },
        {
          key: 'dateFrom-year',
        },
        {
          key: 'dateTo-day',
        },
        {
          key: 'dateTo-month',
        },
        {
          key: 'dateTo-year',
        },
      ],
      allParams: {
        'dateFrom-day': '13',
        'dateFrom-month': '4',
        'dateFrom-year': '22',
        'dateTo-day': '21',
        'dateTo-month': '4',
        'dateTo-year': '22',
        contactTypes: 'IVSP',
      },
    })
    expect(queryString).toEqual('?contactTypes=IVSP')
  })
})
