import { inputDisplayValuesFixedTermLicenceConditions } from './inputDisplayValues'

describe('inputDisplayValuesArrestIssues', () => {
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
        text: 'You must enter details of the arrest issues',
        href: '#hasFixedTermLicenceConditionsDetails',
      },
    }
    const unsavedValues = {
      hasFixedTermLicenceConditions: 'NO',
    }
    const inputDisplayValues = inputDisplayValuesFixedTermLicenceConditions({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'NO',
      details: '',
    })
  })

  it('should use apiValues for value and details, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesFixedTermLicenceConditions({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES',
      details: 'Details...',
    })
  })
})
