// Define the type for `lastKnownAddress` address
type Address = {
  line1: string
  line2: string
  town: string
  postcode: string
  noFixedAbode: boolean
}

// Check if all addresses are effectively empty
export function checkAddresses(addresses: Address[] = []): boolean {
  // Returns true if all addresses are empty, false otherwise
  return addresses.every(
    (address: Address) =>
      address.line1 === '' &&
      address.line2 === '' &&
      address.town === '' &&
      address.postcode === '' &&
      !address.noFixedAbode
  )
}
