import SENTENCED_AS_YOUTH from './ppud/SentencedAsYouth'

export type PpudUpdateSentenceRequest = {
  custodyType: string,
  dateOfSentence: string,
  licenceExpiryDate?: string,
  mappaLevel?: string,
  releaseDate?: string,
  sentenceLength?: SentenceLength,
  espCustodialPeriod?: YearMonth,
  espExtendedPeriod?: YearMonth,
  sentenceExpiryDate?: string,
  sentencingCourt: string,
  sentencedUnder?: string,
  sentencedAsYouth?: SENTENCED_AS_YOUTH,
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
