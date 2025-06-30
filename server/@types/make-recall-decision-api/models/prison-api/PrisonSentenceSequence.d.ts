import { PrisonSentence } from "../PrisonSentence"

export type PrisonSentenceSequence = {
    indexSentence: PrisonSentence,
    sentencesInSequence?: Record<number, PrisonSentence[]>
}