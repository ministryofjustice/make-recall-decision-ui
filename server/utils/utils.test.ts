import {
  convertToTitleCase,
  getProperty,
  hasData,
  isDateTimeRangeCurrent,
  isPreprodOrProd,
  listToString,
  logMessage,
  makePageTitle,
  removeParamsFromQueryString,
  validateCrn,
} from './utils'

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
    expect(listToString(['5 Oak Crescent', 'Southampton', 'S12 345'], '')).toEqual(
      '5 Oak Crescent, Southampton S12 345'
    )
  })

  it('returns a list when no conjunction supplied', () => {
    expect(listToString(['year', 'month', 'day', 'minute'])).toEqual('year, month, day, minute')
  })
})

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
    expect(convertToTitleCase('RobeRT BLoGGS')).toEqual('Robert Bloggs')
  })
  it('Leading spaces', () => {
    expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(convertToTitleCase('Robert-Joe BloGGS-jONes-WILSON')).toEqual('Robert-Joe Bloggs-Jones-Wilson')
  })
})

describe('makePageTitle', () => {
  it('suffixes the supplied heading with the app name', () => {
    const title = makePageTitle({ pageHeading: 'Search', hasErrors: false })
    expect(title).toEqual('Search - Consider a recall')
  })

  it('prefixes the title if there are errors', () => {
    const title = makePageTitle({ pageHeading: 'Search', hasErrors: true })
    expect(title).toEqual('Error: Search - Consider a recall')
  })
})

describe('getProperty', () => {
  it('returns a nested property', () => {
    const obj = {
      legalRepresentativeInfo: {
        email: 'joe@bloggs.com',
      },
    }
    const val = getProperty(obj, 'legalRepresentativeInfo.email')
    expect(val).toEqual('joe@bloggs.com')
  })

  it('returns a top level property', () => {
    const obj = {
      legalRepresentativeInfo: 'info',
    }
    const val = getProperty(obj, 'legalRepresentativeInfo')
    expect(val).toEqual('info')
  })

  it("returns undefined for a nested property that doesn't exist", () => {
    const obj = {
      legalRepresentativeInfo: {
        email: 'joe@bloggs.com',
      },
    }
    const val = getProperty(obj, 'legalRepresentativeInfo.phone')
    expect(val).toBeUndefined()
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

  it('removes search params from an array and ignores empty strings', () => {
    const queryString = removeParamsFromQueryString({
      paramsToRemove: [{ key: 'searchFilters', value: 'MAPPA' }],
      allParams: {
        searchFilters: ['MAPPA', ''],
      },
    })
    expect(queryString).toEqual('')
  })
})

describe('validateCrn', () => {
  const errorData = {
    errorType: 'INVALID_CRN',
    status: 400,
  }
  it('throws if CRN is not a string', () => {
    try {
      validateCrn(true as unknown as string)
    } catch (err) {
      expect(err.data).toEqual(errorData)
    }
  })

  it('throws if CRN is an empty string', () => {
    try {
      validateCrn('')
    } catch (err) {
      expect(err.data).toEqual(errorData)
    }
  })

  it('returns a normalized CRN if valid', () => {
    const result = validateCrn(' x12345 ')
    expect(result).toEqual('X12345')
  })

  it('removes invalid characters', () => {
    const result = validateCrn('​​V127804')
    expect(result).toEqual('V127804')
  })
})

describe('isDateTimeRangeCurrent', () => {
  it('returns true when date today is within date range in config', () => {
    const result = isDateTimeRangeCurrent('2000-09-13', '2050-09-13')
    expect(result).toEqual(true)
  })
  it('returns false when date today is outside date range in config', () => {
    const result = isDateTimeRangeCurrent('2040-09-13', '2050-09-13')
    expect(result).toEqual(false)
  })
  it('returns false when start date is null', () => {
    const result = isDateTimeRangeCurrent(null, '2050-09-13')
    expect(result).toEqual(false)
  })
  it('returns false when start date is empty', () => {
    const result = isDateTimeRangeCurrent('', '2050-09-13')
    expect(result).toEqual(false)
  })
  it('returns false when start date is an invalid date', () => {
    const result = isDateTimeRangeCurrent('invalid string', '2050-09-13')
    expect(result).toEqual(false)
  })
  it('returns false when end date is empty', () => {
    const result = isDateTimeRangeCurrent('2023-09-18', '')
    expect(result).toEqual(false)
  })
  it('returns false when end date is null', () => {
    const result = isDateTimeRangeCurrent('2023-09-18', null)
    expect(result).toEqual(false)
  })
  it('returns false when end date is an invalid date', () => {
    const result = isDateTimeRangeCurrent('2050-09-13', 'invalid string')
    expect(result).toEqual(false)
  })
  it('returns true when the current date and time is within the specified date and time range', () => {
    const dateToday = new Date()
    const startDateTime = new Date()
    startDateTime.setHours(
      dateToday.getHours() - 1,
      dateToday.getMinutes(),
      dateToday.getSeconds(),
      dateToday.getMilliseconds()
    )
    const endDateTime = new Date()
    endDateTime.setHours(
      dateToday.getHours() + 1,
      dateToday.getMinutes(),
      dateToday.getSeconds(),
      dateToday.getMilliseconds()
    )

    const result = isDateTimeRangeCurrent(startDateTime.toISOString(), endDateTime.toISOString())
    expect(result).toEqual(true)
  })
})

describe('isPreprodOrProd', () => {
  it('returns false if given undefined', () => {
    expect(isPreprodOrProd()).toEqual(false)
  })

  it('returns false if given DEVELOPMENT', () => {
    expect(isPreprodOrProd('DEVELOPMENT')).toEqual(false)
  })

  it('returns true if given PREPRODUCTION', () => {
    expect(isPreprodOrProd('PREPRODUCTION')).toEqual(true)
  })

  it('returns true if given PRODUCTION', () => {
    expect(isPreprodOrProd('PRODUCTION')).toEqual(true)
  })
})

describe('hasData', () => {
  it('returns false if given undefined', () => {
    expect(hasData(undefined)).toEqual(false)
  })
  it('returns false if given null', () => {
    expect(hasData(null)).toEqual(false)
  })
  it('returns false if given empty array', () => {
    expect(hasData([])).toEqual(false)
  })
  it('returns true if given array with content', () => {
    expect(hasData([1])).toEqual(true)
  })
  it('returns true if given a value', () => {
    expect(hasData(1)).toEqual(true)
  })
})

describe('logMessage', () => {
  it('log something', () => {
    logMessage('test')
  })
})
