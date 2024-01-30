export type PpudCreateOffenderRequest = {
  address: PpudAddress,
  additionalAddresses: PpudAddress[],
  croNumber: string,
  custodyType: string,
  dateOfBirth: string,
  dateOfSentence: string,
  ethnicity: string,
  firstNames: string,
  familyName: string,
  gender: string,
  indexOffence: string,
  isInCustody: boolean,
  mappaLevel: string,
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
