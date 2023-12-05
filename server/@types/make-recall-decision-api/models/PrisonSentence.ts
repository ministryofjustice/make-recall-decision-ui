export type PrisonSentence = {
  bookingId: number;
  sentenceSequence: number;
  lineSequence: number;
  caseSequence: number;
  courtDescription: string;
  sentenceStatus: string;
  sentenceCategory: string;
  sentenceCalculationType: string;
  sentenceTypeDescription: string;
  sentenceDate: string;
  sentenceStartDate: string;
  sentenceEndDate: string;
  terms: Term[],
  offences: SentenceOffence[]
};

export type Term = {
  years: number;
  months: number;
  weeks: number;
  days: number
  code: string;
}

export type SentenceOffence = {
  offenderChargeId: number;
  offenceStartDate: string;
  offenceStatute: string;
  offenceCode: string
  offenceDescription: string;
  indicators: string[];
}
