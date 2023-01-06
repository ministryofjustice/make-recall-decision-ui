import { inputDisplayValuesManagerRecordDecision } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { cleanseUiList } from '../../../utils/lists'
import { ManagerRecallDecisionTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/ManagerRecallDecisionTypeSelectedValue'

describe('inputDisplayValuesManagerRecordDecision', () => {
  const apiValues = {
    managerRecallDecision: {
      selected: {
        value: ManagerRecallDecisionTypeSelectedValue.value.RECALL,
        details: 'Details...',
      },
      allOptions: cleanseUiList(formOptions.recallTypeManager),
    },
  }

  it("should use unsaved value for detail if there's an error for the selection", () => {
    const errors = {
      recallTypeManager: {
        text: 'You must select a recommendation',
        href: '#recallTypeManager',
      },
    }
    const unsavedValues = {
      recallTypeManagerDetail: 'Detail...',
    }
    const inputDisplayValues = inputDisplayValuesManagerRecordDecision({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
      detail: 'Detail...',
    })
  })

  it("should use empty string for detail if there's no unsaved or API value and an error for the selection", () => {
    const errors = {
      recallTypeManager: {
        text: 'You must select a recommendation',
        href: '#recallTypeManager',
      },
    }
    const inputDisplayValues = inputDisplayValuesManagerRecordDecision({ errors, unsavedValues: {}, apiValues: {} })
    expect(inputDisplayValues).toEqual({
      value: '',
      detail: '',
    })
  })

  it("should use unsavedValue for value, if there's an error for detail", () => {
    const errors = {
      recallTypeManagerDetail: {
        text: 'You must explain why you recommend this recall type',
        href: '#recallTypeManagerDetail',
      },
    }
    const unsavedValues = {
      recallType: 'RECALL',
    }
    const inputDisplayValues = inputDisplayValuesManagerRecordDecision({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'RECALL',
      detail: '',
    })
  })

  it("should use empty string for value if there's no unsaved or API value and an error for detail", () => {
    const errors = {
      recallTypeManagerDetail: {
        text: 'You must explain why you recommend this recall type',
        href: '#recallTypeManagerDetail',
      },
    }
    const inputDisplayValues = inputDisplayValuesManagerRecordDecision({ errors, unsavedValues: {}, apiValues: {} })
    expect(inputDisplayValues).toEqual({
      value: '',
      detail: '',
    })
  })

  it('should use apiValues for value and detail, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesManagerRecordDecision({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'RECALL',
      detail: 'Details...',
    })
  })
})
