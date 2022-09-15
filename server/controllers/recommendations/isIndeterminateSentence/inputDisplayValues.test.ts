import { inputDisplayValuesIsIndeterminateSentence } from './inputDisplayValues'

describe('inputDisplayValuesIsIndeterminateSentence', () => {
  const apiValues = {
    isIndeterminateSentence: true,
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      isIndeterminateSentence: {
        text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
        href: '#isIndeterminateSentence',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIsIndeterminateSentence({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIsIndeterminateSentence({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES',
    })
  })
})
