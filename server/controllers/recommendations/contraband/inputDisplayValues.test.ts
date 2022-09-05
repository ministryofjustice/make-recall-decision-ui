import { inputDisplayValuesContraband } from './inputDisplayValues'

describe('inputDisplayValuesContraband', () => {
  const apiValues = {
    hasContrabandRisk: {
      selected: true,
      details: 'Details...',
    },
  }

  it("should use undefined and empty string for value and details if there's an error for value", () => {
    const errors = {
      hasContrabandRisk: {
        text: "Select whether there's anything the police should know",
        href: '#hasContrabandRisk',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesContraband({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: undefined,
      details: '',
    })
  })

  it("should use unsavedValue over apiValue for value, and reset details, if there's an error for missing details", () => {
    const errors = {
      hasContrabandRiskDetailsYes: {
        text: 'You must enter details of the arrest issues',
        href: '#hasContrabandRiskDetailsYes',
      },
    }
    const unsavedValues = {
      hasContrabandRisk: 'NO',
    }
    const inputDisplayValues = inputDisplayValuesContraband({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'NO',
      details: '',
    })
  })

  it('should use apiValues for value and details, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesContraband({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES',
      details: 'Details...',
    })
  })
})
