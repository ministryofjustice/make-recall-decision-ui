import { getDisplayValueForOption } from './getDisplayValueForOption'
import { formOptions } from '../formOptions/formOptions'

describe('getDisplayValueForOption', () => {
  it('returns the text label for the provided value', () => {
    const label = getDisplayValueForOption({ value: 'FIXED_TERM', allOptions: formOptions.recallType })
    expect(label).toEqual('Fixed term recall')
  })

  it("returns the provided value if it's is not found in options", () => {
    const label = getDisplayValueForOption({ value: 'FIXED_TERM', allOptions: formOptions.standardLicenceConditions })
    expect(label).toEqual('FIXED_TERM')
  })
})
