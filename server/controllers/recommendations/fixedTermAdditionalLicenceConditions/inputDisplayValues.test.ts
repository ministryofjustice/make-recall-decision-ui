import { inputDisplayValuesFixedTermLicenceConditions } from './inputDisplayValues'
import { YesNoValues } from '../formOptions/yesNo'

describe('inputDisplayValuesFixedTermLicenceConditions', () => {
  const apiValues = {
    fixedTermAdditionalLicenceConditions: {
      selected: true,
      details: 'Details...',
    },
  }

  it("should use undefined and empty string for value and details if there's an error for value", () => {
    const errors = {
      hasFixedTermLicenceConditions: {
        text: "Select whether there's anything the police should know",
        href: '#hasFixedTermLicenceConditions',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesFixedTermLicenceConditions({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: undefined,
      details: '',
    })
  })

  it("should use unsavedValue over apiValue for value, and reset details, if there's an error for missing details", () => {
    const errors = {
      hasFixedTermLicenceConditionsDetails: {
        text: 'Enter details of the arrest issues',
        href: '#hasFixedTermLicenceConditionsDetails',
      },
    }
    const unsavedValues = {
      hasFixedTermLicenceConditions: YesNoValues.NO,
    }
    const inputDisplayValues = inputDisplayValuesFixedTermLicenceConditions({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: YesNoValues.NO,
      details: '',
    })
  })

  it('should use apiValues for value and details, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesFixedTermLicenceConditions({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: YesNoValues.YES,
      details: 'Details...',
    })
  })
})
