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
        selectedOptions: [{ mainCatCode: 'NLC5', subCatCode: 'NST14' }],
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
      additionalLicenceConditions: [
        {
          mainCatCode: 'NLC5',
          subCatCode: 'NST14',
        },
      ],
      standardLicenceConditions: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
    })
  })

  it('should use only standardLicenceConditions from API for value, if no error or unsaved values', () => {
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

  it('should use additional licence conditions from apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesLicenceConditions({
      errors: undefined,
      unsavedValues,
      apiValues: {
        licenceConditionsBreached: {
          additionalLicenceConditions: {
            selectedOptions: [{ mainCatCode: 'NLC5', subCatCode: 'NST14' }],
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
      },
    })
    expect(inputDisplayValues).toEqual({
      additionalLicenceConditions: [
        {
          mainCatCode: 'NLC5',
          subCatCode: 'NST14',
        },
      ],
    })
  })

  it('should use cvlLicenceConditionsBreached', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesLicenceConditions({
      errors: undefined,
      unsavedValues,
      apiValues: {
        cvlLicenceConditionsBreached: {
          standardLicenceConditions: {
            selected: ['1', '2'],
            allOptions: [
              {
                code: '1',
                text: 'text',
              },
            ],
          },
          additionalLicenceConditions: {
            selected: ['3'],
            allOptions: [
              {
                code: '3',
                text: 'text',
              },
            ],
          },
        },
      },
    })
    expect(inputDisplayValues).toEqual({
      additionalLicenceConditions: ['3'],
      standardLicenceConditions: ['1', '2'],
    })
  })
})
