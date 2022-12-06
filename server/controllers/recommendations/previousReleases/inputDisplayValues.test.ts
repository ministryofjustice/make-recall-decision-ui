import { inputDisplayValuesPreviousReleases } from './inputDisplayValues'

describe('inputDisplayValuesPreviousReleases', () => {
  const apiValues = {
    previousReleases: {
      hasBeenReleasedPreviously: true,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      hasBeenReleasedPreviously: {
        text: 'Select whether previously released',
        href: '#hasBeenReleasedPreviously',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesPreviousReleases({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesPreviousReleases({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES',
    })
  })
})
