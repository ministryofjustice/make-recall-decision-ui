// addressChecker.test.ts
import { checkIfAddressesAreEmpty } from './addressChecker'

describe('checkAddresses', () => {
  test('returns true when all addresses are empty', () => {
    const addresses = [{ line1: '', line2: '', town: '', postcode: '', noFixedAbode: false }]
    expect(checkIfAddressesAreEmpty(addresses)).toBe(true)
  })

  test('returns false when the array contains one empty object and one with a fake address', () => {
    const addresses = [
      { line1: '', line2: '', town: '', postcode: '', noFixedAbode: false },
      {
        line1: '34 Not THe Address',
        line2: 'You are looking for',
        town: 'Anytown',
        postcode: 'ST11O99',
        noFixedAbode: false,
      },
    ]
    expect(checkIfAddressesAreEmpty(addresses)).toBe(false)
  })

  test('returns false when any address contains data', () => {
    const addresses = [
      { line1: '123 Oak St', line2: '', town: 'Birmingham', postcode: '12345', noFixedAbode: false },
      { line1: '', line2: '', town: '', postcode: '', noFixedAbode: true },
      {
        line1: '34 Not THe Address',
        line2: 'You are looking for',
        town: 'Anytown',
        postcode: 'ST11O99',
        noFixedAbode: false,
      },
    ]
    expect(checkIfAddressesAreEmpty(addresses)).toBe(false)
  })

  test('returns true for an empty array', () => {
    expect(checkIfAddressesAreEmpty()).toBe(true)
  })
})
