import { inputDisplayValuesIsExtendedSentence } from './inputDisplayValues'

describe('inputDisplayValuesIsExtendedSentence', () => {
  const apiValues = {
    isExtendedSentence: true,
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      isExtendedSentence: {
        text: 'Select whether {{ fullName }} is on an extended sentence or not',
        href: '#isExtendedSentence',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIsExtendedSentence({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIsExtendedSentence({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES',
    })
  })
})
