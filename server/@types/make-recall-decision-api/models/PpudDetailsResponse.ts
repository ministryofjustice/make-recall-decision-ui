export type PpudDetailsResponse = {
  offender: PpudDetailsOffender
};

export type PpudDetailsOffender = {
  id: string,
  croOtherNumber: string,
  dateOfBirth: string,
  ethnicity: string,
  familyName: string,
  firstNames: string,
  gender: string,
  immigrationStatus: string,
  nomsId: string,
  prisonerCategory: string,
  prisonNumber: string,
  sentences: PpudDetailsSentence[],
  status: string,
  youngOffender: string
}

export type PpudDetailsSentence = {
  dateOfSentence: string,
  custodyType: string,
  mappaLevel: string,
}
