import { inputDisplayValuesRecallType } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesRecallType', () => {
  const apiValues = {
    recallType: {
      selected: {
        value: 'FIXED_TERM' as RecallTypeSelectedValue.value,
        details: 'Details...',
      },
      allOptions: formOptions.recallType,
    },
  }

  it("should use empty string for value and details if there's an error for value", () => {
    const errors = {
      recallType: {
        text: 'You must select a recommendation',
        href: '#recallType',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesRecallType({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
      details: '',
    })
  })

  it("should use unsavedValue over apiValue for value, and reset details, if there's an error for fixed term details", () => {
    const errors = {
      recallTypeDetailsFixedTerm: {
        text: 'You must explain why you recommend this recall type',
        href: '#recallTypeDetailsFixedTerm',
      },
    }
    const unsavedValues = {
      recallType: 'STANDARD',
    }
    const inputDisplayValues = inputDisplayValuesRecallType({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'STANDARD',
      details: '',
    })
  })

  it("should use unsavedValue over apiValue for value, and reset details, if there's an error for standard details", () => {
    const errors = {
      recallTypeDetailsStandard: {
        text: 'You must explain why you recommend this recall type',
        href: '#recallTypeDetailsStandard',
      },
    }
    const unsavedValues = {
      recallType: 'STANDARD',
    }
    const inputDisplayValues = inputDisplayValuesRecallType({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'STANDARD',
      details: '',
    })
  })

  it('should use apiValues for value and details, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesRecallType({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'FIXED_TERM',
      details: 'Details...',
    })
  })
})
