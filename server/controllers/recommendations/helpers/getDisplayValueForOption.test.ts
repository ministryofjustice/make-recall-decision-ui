import { getDisplayValueForOption } from './getDisplayValueForOption'
import { formOptions } from '../formOptions'

describe('getDisplayValueForOption', () => {
  it('returns the text label for the provided value', () => {
    const valueWithOptions = {
      value: 'FIXED_TERM',
      options: formOptions.recallType,
    }
    const label = getDisplayValueForOption(valueWithOptions)
    expect(label).toEqual('Fixed term recall')
  })

  it("returns the provided value if it's is not found in options", () => {
    const valueWithOptions = {
      value: 'FIXED_TERM',
      options: formOptions.standardLicenceConditions,
    }
    const label = getDisplayValueForOption(valueWithOptions)
    expect(label).toEqual('FIXED_TERM')
  })
})
