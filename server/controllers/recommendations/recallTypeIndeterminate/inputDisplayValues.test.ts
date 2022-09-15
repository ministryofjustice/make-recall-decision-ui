import { inputDisplayValuesRecallTypeIndeterminate } from './inputDisplayValues'
import { formOptions } from '../helpers/formOptions'
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
})
