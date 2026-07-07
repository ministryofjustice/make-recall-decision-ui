import SENTENCED_AS_YOUTH from './ppud/SentencedAsYouth'

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
  establishment: string,
  mappaLevel: string,
  nomsId: string,
  prisonNumber: string,
  sentencedAsYouth: SENTENCED_AS_YOUTH,
};

export type PpudAddress = {
  premises: string,
  line1: string,
  line2: string,
  postcode: string,
  phoneNumber: string
}
