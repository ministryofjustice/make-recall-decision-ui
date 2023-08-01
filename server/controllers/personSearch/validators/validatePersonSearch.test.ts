import { validatePersonSearch } from './validatePersonSearch'

describe('validatePersonSearch', () => {
  it('returns an error if CRN is undefined', () => {
    expect(validatePersonSearch()).toEqual({
      errors: [
        {
          href: '#crn',
          name: 'crn',
          text: 'Enter a Case Reference Number (CRN) in the correct format, for example X123456',
          errorId: 'invalidCrnFormat',
        },
      ],
      unsavedValues: {},
    })
  })

  it('returns an error if CRN is not a string', () => {
    expect(validatePersonSearch(999 as unknown as string)).toEqual({
      errors: [
        {
          href: '#crn',
          name: 'crn',
          text: 'Enter a Case Reference Number (CRN) in the correct format, for example X123456',
          errorId: 'invalidCrnFormat',
        },
      ],
      unsavedValues: {
        crn: 999,
      },
    })
  })

  it('returns an error if CRN is an empty string', () => {
    expect(validatePersonSearch('')).toEqual({
      errors: [
        {
          href: '#crn',
          name: 'crn',
          text: 'Enter a Case Reference Number (CRN)',
          errorId: 'missingCrn',
        },
      ],
      unsavedValues: {
        crn: '',
      },
    })
  })

  it('returns an error if CRN is empty after HTML stripped out', () => {
    expect(validatePersonSearch('<script></script>')).toEqual({
      errors: [
        {
          href: '#crn',
          name: 'crn',
          text: 'Enter a Case Reference Number (CRN)',
          errorId: 'missingCrn',
        },
      ],
      unsavedValues: {
        crn: '',
      },
    })
  })

  it('returns the search value, converted to uppercase', () => {
    expect(validatePersonSearch('abc')).toEqual({
      searchValue: 'ABC',
    })
  })
})
