import { inputDisplayValuesEmergencyRecall } from './inputDisplayValues'

describe('inputDisplayValuesEmergencyRecall', () => {
  const apiValues = {
    isThisAnEmergencyRecall: true,
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      isThisAnEmergencyRecall: {
        text: 'You must select whether this is an emergency recall or not',
        href: '#isThisAnEmergencyRecall',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesEmergencyRecall({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesEmergencyRecall({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES',
    })
  })
})
