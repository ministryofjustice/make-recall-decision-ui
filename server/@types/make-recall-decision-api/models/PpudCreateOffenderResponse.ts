export type PpudCreateOffenderResponse = {
  offender: PpudCreateOffender
};

export type PpudCreateOffender = {
  id?: string,
  sentence?: PpudCreateSentence
}

export type PpudCreateSentence = {
  id?: string
}