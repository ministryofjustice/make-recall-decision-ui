import { inputDisplayValuesAlternativesToRecallTried } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { ValueWithDetails } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesAlternativesToRecallTried', () => {
  const apiValues = {
    alternativesToRecallTried: {
      selected: [{ value: 'INCREASED_FREQUENCY' }] as ValueWithDetails[],
      allOptions: formOptions.alternativesToRecallTried,
    },
  }

  it("should use empty array for value if there's an error", () => {
    const errors = {
      alternativesToRecallTried: {
        text: 'You must indicate which alternatives to recall have been tried already',
        href: '#alternativesToRecallTried',
      },
    }
    const inputDisplayValues = inputDisplayValuesAlternativesToRecallTried({
      errors,
      unsavedValues: {
        alternativesToRecallTried: [],
      },
      apiValues,
    })
    expect(inputDisplayValues).toEqual([])
  })

  it('should use an unsaved value for the selected option, if details are missing', () => {
    const errors = {
      alternativesToRecallTried: {
        text: 'Enter details',
        href: '#alternativesToRecallTriedDetails',
      },
    }
    const inputDisplayValues = inputDisplayValuesAlternativesToRecallTried({
      errors,
      unsavedValues: {
        alternativesToRecallTried: [
          { value: 'EXTRA_LICENCE_CONDITIONS', details: 'Details' },
          { value: 'REFERRAL_TO_APPROVED_PREMISES', details: '' },
        ],
      },
      apiValues,
    })
    expect(inputDisplayValues).toEqual([
      { value: 'EXTRA_LICENCE_CONDITIONS', details: 'Details' },
      { value: 'REFERRAL_TO_APPROVED_PREMISES', details: '' },
    ])
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesAlternativesToRecallTried({
      errors: undefined,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual([{ value: 'INCREASED_FREQUENCY' }])
  })
})
