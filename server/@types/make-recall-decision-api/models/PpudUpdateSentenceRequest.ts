export type PpudUpdateSentenceRequest = {
  custodyType: string,
  dateOfSentence: string,
  licenceExpiryDate: string,
  mappaLevel: string,
  releaseDate: string,
  sentenceLength: SentenceLength,
  espCustodialPeriod?: YearMonth,
  espExtendedPeriod?: YearMonth,
  sentenceExpiryDate: string,
  sentencingCourt: string,
};

export type SentenceLength = {
  partYears: number,
  partMonths: number,
  partDays: number,
}

export type YearMonth = {
  years: number,
  months: number,
}
