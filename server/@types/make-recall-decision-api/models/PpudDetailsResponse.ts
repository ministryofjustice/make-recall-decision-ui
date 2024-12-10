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
  id: string,
  sentenceExpiryDate: string,
  dateOfSentence: string,
  custodyType: string,
  mappaLevel: string,
  licenceExpiryDate: string,
  offence: PpudDetailsOffence,
  releaseDate: string,
  sentenceLength: PpudDetailsSentenceLength,
  sentencingCourt: string,
}

export type PpudDetailsOffence = {
  indexOffence: string,
  dateOfIndexOffence: string,
}

export type PpudDetailsSentenceLength = {
  partYears: number,
  partMonths: number,
  partDays: number,
}
