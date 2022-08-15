import { inputDisplayValuesVictimContactScheme } from './inputDisplayValues'
import { formOptions } from '../helpers/formOptions'

describe('inputDisplayValuesVictimContactScheme', () => {
  const apiValues = {
    hasVictimsInContactScheme: {
      selected: 'NO',
      allOptions: formOptions.hasVictimsInContactScheme,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      hasVictimsInContactScheme: {
        text: 'Select whether there are any victims in the victim contact scheme',
        href: '#hasVictimsInContactScheme',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesVictimContactScheme({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesVictimContactScheme({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'NO',
    })
  })
})
