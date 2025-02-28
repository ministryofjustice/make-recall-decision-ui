export type PpudUpdateOffenderRequest = {
  address: PpudAddress,
  additionalAddresses: PpudAddress[],
  croNumber: string,
  dateOfBirth: string,
  ethnicity: string,
  firstNames: string,
  familyName: string,
  gender: string,
  isInCustody: boolean,
  establishment: string,
  nomsId: string,
  prisonNumber: string,
};

export type PpudAddress = {
  premises: string,
  line1: string,
  line2: string,
  postcode: string,
  phoneNumber: string
}
