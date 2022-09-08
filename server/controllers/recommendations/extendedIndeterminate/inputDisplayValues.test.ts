import { inputDisplayValuesExtendedIndeterminate } from './inputDisplayValues'

describe('inputDisplayValuesExtendedIndeterminate', () => {
  const apiValues = {
    isExtendedOrIndeterminateSentence: true,
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      isExtendedOrIndeterminateSentence: {
        text: 'Select whether the person on probation is on an extended or indeterminate sentence or not',
        href: '#isExtendedOrIndeterminateSentence',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesExtendedIndeterminate({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesExtendedIndeterminate({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES',
    })
  })
})
