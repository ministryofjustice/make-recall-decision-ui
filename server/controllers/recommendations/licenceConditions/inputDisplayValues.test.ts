import { inputDisplayValuesLicenceConditions } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'

describe('inputDisplayValuesLicenceConditions', () => {
  const apiValues = {
    licenceConditionsBreached: {
      standardLicenceConditions: {
        selected: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
        allOptions: formOptions.standardLicenceConditions,
      },
      additionalLicenceConditions: {
        selected: ['NST14'],
        allOptions: [
          {
            mainCatCode: 'NLC5',
            subCatCode: 'NST14',
            title: 'Disclosure of information',
            details: 'Notify your supervising officer of any intimate relationships',
            note: 'Persons wife is Joan Smyth',
          },
        ],
      },
    },
  }

  it("should use empty values if there's an error", () => {
    const errors = {
      licenceConditionsBreached: {
        errorId: 'hasMultipleActiveCustodial',
        href: '#licenceConditionsBreached',
        name: 'licenceConditionsBreached',
        text: 'This person has multiple active custodial convictions',
      },
    }
    const inputDisplayValues = inputDisplayValuesLicenceConditions({
      errors,
      unsavedValues: {},
      apiValues,
    })
    expect(inputDisplayValues).toEqual({})
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesLicenceConditions({
      errors: undefined,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual({
      additionalLicenceConditions: ['NST14'],
      standardLicenceConditions: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesLicenceConditions({
      errors: undefined,
      unsavedValues,
      apiValues: {
        licenceConditionsBreached: {
          standardLicenceConditions: {
            selected: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
            allOptions: formOptions.standardLicenceConditions,
          },
        },
      },
    })
    expect(inputDisplayValues).toEqual({
      standardLicenceConditions: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
    })
  })
})
