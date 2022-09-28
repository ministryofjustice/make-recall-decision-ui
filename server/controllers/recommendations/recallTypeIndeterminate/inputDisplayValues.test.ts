import { inputDisplayValuesRecallTypeIndeterminate } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesRecallTypeIndeterminate', () => {
  const apiValues = {
    recallType: {
      selected: {
        value: 'NO_RECALL' as RecallTypeSelectedValue.value,
      },
      allOptions: formOptions.recallType,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      recallType: {
        text: 'You must select a recommendation',
        href: '#recallType',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesRecallTypeIndeterminate({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesRecallTypeIndeterminate({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'NO_RECALL',
    })
  })

  it('should set emergency recall if recallType is standard and emergency recall true, if no error or unsaved values', () => {
    const apiResponse = {
      recallType: {
        selected: {
          value: 'STANDARD' as RecallTypeSelectedValue.value,
        },
        allOptions: formOptions.recallType,
      },
      isThisAnEmergencyRecall: true,
    }
    const inputDisplayValues = inputDisplayValuesRecallTypeIndeterminate({
      errors: {},
      unsavedValues: {},
      apiValues: apiResponse,
    })
    expect(inputDisplayValues).toEqual({
      value: 'EMERGENCY',
    })
  })

  it('should set no value if recallType is not set, if no error or unsaved values', () => {
    const apiResponse = {
      isThisAnEmergencyRecall: true,
    }
    const inputDisplayValues = inputDisplayValuesRecallTypeIndeterminate({
      errors: {},
      unsavedValues: {},
      apiValues: apiResponse,
    })
    expect(inputDisplayValues).toEqual({
      value: undefined,
    })
  })
})
