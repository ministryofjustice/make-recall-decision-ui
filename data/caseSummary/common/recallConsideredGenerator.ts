import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGeneratorWithSeries } from '../../@generators/dataGenerators'
import { RecallConsidered } from '../../../server/@types/make-recall-decision-api'

export type RecallConsideredOptions = {
  id: number
  userId?: string
  createdDate?: string
  userName?: string
  recallConsideredDetail?: string
}

const generateInternal = (options?: RecallConsideredOptions): RecallConsidered => ({
  id: options?.id ?? faker.number.int(),
  userId: options?.userId ?? faker.string.uuid(),
  createdDate: options?.createdDate ?? faker.date.past().toISOString(),
  userName: options?.userName ?? faker.internet.username(),
  recallConsideredDetail: options?.recallConsideredDetail ?? faker.lorem.sentence(),
})

export const RecallConsideredGenerator: DataGeneratorWithSeries<RecallConsidered, RecallConsideredOptions> = {
  generate: generateInternal,
  generateSeries: optionsSeries => optionsSeries?.map(options => generateInternal(options)),
}
