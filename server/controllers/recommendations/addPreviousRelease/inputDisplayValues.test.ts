import { inputDisplayValuesAddPreviousRelease } from './inputDisplayValues'

describe('inputDisplayValuesAddPreviousRelease', () => {
  const apiValues = {
    previousReleases: {
      previousReleaseDates: ['2022-05-13'],
    },
  }

  it("should use empty strings for value if there's an error for value", () => {
    const errors = {
      previousReleaseDate: {
        text: 'The previous release date must have a real day and month',
        href: '#previousReleaseDate',
        values: {
          day: '42',
          month: '23',
          year: '2022',
        },
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesAddPreviousRelease({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: {
        day: '42',
        month: '23',
        year: '2022',
      },
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesAddPreviousRelease({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: {
        day: '13',
        month: '05',
        year: '2022',
      },
    })
  })

  it('should return undefined if no error or apiValue', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesAddPreviousRelease({ errors, unsavedValues, apiValues: {} })
    expect(inputDisplayValues).toEqual({
      value: undefined,
    })
  })
})
