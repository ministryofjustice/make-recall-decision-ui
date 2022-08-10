import { inputDisplayValuesCustodyStatus } from './inputDisplayValues'
import { formOptions } from '../helpers/formOptions'

describe('inputDisplayValuesCustodyStatus', () => {
  const apiValues = {
    custodyStatus: {
      value: 'YES_POLICE',
      options: formOptions.custodyStatus,
    },
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      custodyStatus: {
        text: 'Select an option',
        href: '#custodyStatus',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesCustodyStatus({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesCustodyStatus({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES_POLICE',
    })
  })
})
