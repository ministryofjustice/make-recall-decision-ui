import { inputDisplayValuesAlternativesToRecallTried } from './inputDisplayValues'
import { formOptions } from '../helpers/formOptions'
import { SelectedAlternative } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesAlternativesToRecallTried', () => {
  const apiValues = {
    alternativesToRecallTried: {
      selected: ['INCREASED_FREQUENCY'] as SelectedAlternative[],
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

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesAlternativesToRecallTried({
      errors: undefined,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual(['INCREASED_FREQUENCY'])
  })
})
