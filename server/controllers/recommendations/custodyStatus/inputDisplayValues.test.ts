import { inputDisplayValuesCustodyStatus } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { CustodyStatus } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesCustodyStatus', () => {
  const apiValues = {
    custodyStatus: {
      selected: 'YES_PRISON' as CustodyStatus.selected,
      allOptions: formOptions.custodyStatus,
    },
  }

  it("should use undefined and empty string for value and details if there's an error for value", () => {
    const errors = {
      custodyStatus: {
        text: 'Select whether the person is in custody or not',
        href: '#custodyStatus',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesCustodyStatus({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: undefined,
      details: '',
    })
  })

  it("should use unsavedValue over apiValue for value, and reset details, if there's an error for missing details", () => {
    const errors = {
      custodyStatusDetailsYesPolice: {
        text: 'Enter the custody address',
        href: '#custodyStatusDetailsYesPolice',
      },
    }
    const unsavedValues = {
      custodyStatus: 'YES_POLICE',
    }
    const inputDisplayValues = inputDisplayValuesCustodyStatus({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES_POLICE',
      details: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesCustodyStatus({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'YES_PRISON',
    })
  })
})
