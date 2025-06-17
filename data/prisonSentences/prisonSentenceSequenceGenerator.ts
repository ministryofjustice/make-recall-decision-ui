import { PrisonSentenceSequence } from '../../server/@types/make-recall-decision-api/models/prison-api/PrisonSentenceSequence'
import { PrisonSentence } from '../../server/@types/make-recall-decision-api/models/PrisonSentence'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { PrisonSentenceGenerator, PrisonSentenceOptions } from './prisonSentenceGenerator'

export type PrisonSentenceSequenceOptions = {
  indexSentence?: PrisonSentenceOptions
  sentencesInSequence?: Map<number, PrisonSentenceOptions[]>
}

const generateInternal = (options?: PrisonSentenceSequenceOptions): PrisonSentenceSequence => ({
  indexSentence: PrisonSentenceGenerator.generate(options?.indexSentence),
  sentencesInSequence: options?.sentencesInSequence
    ? Object.fromEntries(
        new Map(
          Array.from(
            options.sentencesInSequence,
            ([id, opt]) => [id, PrisonSentenceGenerator.generateSeries(opt)] as [number, PrisonSentence[]]
          )
        )
      )
    : null,
})

export const PrisonSentenceSequenceGenerator: DataGeneratorWithSeries<
  PrisonSentenceSequence,
  PrisonSentenceSequenceOptions
> = {
  generate: options => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(s => generateInternal(s)),
}
