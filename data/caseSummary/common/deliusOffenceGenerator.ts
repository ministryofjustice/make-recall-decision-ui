import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGeneratorWithSeries } from '../../@generators/dataGenerators'
import { DeliusOffence } from '../../../server/@types/make-recall-decision-api/models/Offence'

export type DeliusOffenceOptions = {
  description?: string
  code?: string
  date?: string
}

const generateInternal: (options?: DeliusOffenceOptions) => DeliusOffence = options => ({
  description: options?.description ?? faker.lorem.words(),
  code: options?.code ?? faker.number.int({ min: 0, max: 999 }).toString(),
  date: options?.date ?? faker.date.past().toISOString(),
})

export const DeliusOffenceGenerator: DataGeneratorWithSeries<DeliusOffence, DeliusOffenceOptions> = {
  generate: generateInternal,
  generateSeries: optionSeries => optionSeries?.map(options => generateInternal(options)),
}
