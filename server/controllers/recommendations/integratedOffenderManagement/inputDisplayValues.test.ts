import { inputDisplayValuesIntegratedOffenderManagement } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { VictimsInContactScheme } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesIntegratedOffenderManagement', () => {
  const apiValues = {
    isUnderIntegratedOffenderManagement: {
      selected: 'NO' as VictimsInContactScheme.selected,
      allOptions: formOptions.isUnderIntegratedOffenderManagement,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      isUnderIntegratedOffenderManagement: {
        text: 'You must select whether there are any ...',
        href: '#isUnderIntegratedOffenderManagement',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIntegratedOffenderManagement({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIntegratedOffenderManagement({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'NO',
    })
  })
})
