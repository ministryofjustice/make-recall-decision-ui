import { inputDisplayValuesVictimContactScheme } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { VictimsInContactScheme } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesVictimContactScheme', () => {
  const apiValues = {
    hasVictimsInContactScheme: {
      selected: 'NO' as VictimsInContactScheme.selected,
      allOptions: formOptions.hasVictimsInContactScheme,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      hasVictimsInContactScheme: {
        text: 'You must select whether there are any victims in the victim contact scheme',
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
