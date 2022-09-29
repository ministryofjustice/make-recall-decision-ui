import { inputDisplayValuesIndeterminateDetails } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { ValueWithDetails } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesIndeterminateDetails', () => {
  const apiValues = {
    indeterminateOrExtendedSentenceDetails: {
      selected: [{ value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE' }] as ValueWithDetails[],
      allOptions: formOptions.indeterminateOrExtendedSentenceDetails,
    },
  }

  it("should use empty array for value if there's an error", () => {
    const errors = {
      indeterminateOrExtendedSentenceDetails: {
        text: 'Select at least one of the criteria',
        href: '#indeterminateOrExtendedSentenceDetails',
      },
    }
    const inputDisplayValues = inputDisplayValuesIndeterminateDetails({
      errors,
      unsavedValues: {
        indeterminateOrExtendedSentenceDetails: [],
      },
      apiValues,
    })
    expect(inputDisplayValues).toEqual([])
  })

  it('should use an unsaved value for the selected option, if details are missing', () => {
    const errors = {
      indeterminateOrExtendedSentenceDetails: {
        text: 'Enter details about the person being out of touch',
        href: '#indeterminateOrExtendedSentenceDetails',
      },
    }
    const inputDisplayValues = inputDisplayValuesIndeterminateDetails({
      errors,
      unsavedValues: {
        indeterminateOrExtendedSentenceDetails: [
          { value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE', details: 'Details' },
          { value: 'OUT_OF_TOUCH', details: '' },
        ],
      },
      apiValues,
    })
    expect(inputDisplayValues).toEqual([
      { value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE', details: 'Details' },
      { value: 'OUT_OF_TOUCH', details: '' },
    ])
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIndeterminateDetails({
      errors: undefined,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual([{ value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE' }])
  })
})
