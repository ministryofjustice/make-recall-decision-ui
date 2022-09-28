import { inputDisplayValuesWhyConsideredRecall } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { WhyConsideredRecall } from '../../../@types/make-recall-decision-api/models/WhyConsideredRecall'

describe('inputDisplayValuesVictimContactScheme', () => {
  const apiValues = {
    whyConsideredRecall: {
      selected: 'CONTACT_STOPPED' as WhyConsideredRecall.selected,
      allOptions: formOptions.whyConsideredRecall,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      whyConsideredRecall: {
        text: 'Select a reason why you considered recall',
        href: '#whyConsideredRecall',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesWhyConsideredRecall({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesWhyConsideredRecall({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'CONTACT_STOPPED',
    })
  })
})
