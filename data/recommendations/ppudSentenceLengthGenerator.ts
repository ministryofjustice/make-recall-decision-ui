import { faker } from '@faker-js/faker'
import { DataGenerator, IncludeNoneOrOption } from '../@generators/dataGenerators'
import { PpudSentenceLength } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { resolveIncludeNoneOrOption } from '../@generators/dataGenerator.utils'

export type PpudSentenceLengthOptions = {
  partYears?: IncludeNoneOrOption<number>
  partMonths?: IncludeNoneOrOption<number>
  partDays?: IncludeNoneOrOption<number>
}

export const PpudSentenceLengthGenerator: DataGenerator<PpudSentenceLength, PpudSentenceLengthOptions> = {
  generate: options => ({
    partYears: resolveIncludeNoneOrOption(options?.partYears, () => faker.number.int({ min: 1, max: 5 })),
    partMonths: resolveIncludeNoneOrOption(options?.partMonths, () => faker.number.int({ min: 1, max: 11 })),
    partDays: resolveIncludeNoneOrOption(options?.partDays, () => faker.number.int({ min: 1, max: 29 })),
  }),
}
