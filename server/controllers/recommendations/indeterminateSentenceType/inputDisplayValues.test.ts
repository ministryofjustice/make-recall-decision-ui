import { inputDisplayValuesIndeterminateSentenceType } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { IndeterminateSentenceType } from '../../../@types/make-recall-decision-api/models/IndeterminateSentenceType'

describe('inputDisplayValuesVictimContactScheme', () => {
  const apiValues = {
    indeterminateSentenceType: {
      selected: 'DPP' as IndeterminateSentenceType.selected,
      allOptions: formOptions.indeterminateSentenceType,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      indeterminateSentenceType: {
        text: 'Select whether {{ fullName }} is on a life, IPP or DPP sentence',
        href: '#indeterminateSentenceType',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIndeterminateSentenceType({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesIndeterminateSentenceType({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'DPP',
    })
  })
})
