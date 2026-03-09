import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGeneratorWithSeries } from '../../@generators/dataGenerators'
import { LicenceCondition } from '../../../server/@types/make-recall-decision-api'

export type LicenceConditionOptions = {
  notes?: string
  mainCategory?: {
    code: string
    description: string
  }
  subCategory?: {
    code: string
    description: string
  }
}

const generateInternal: (options?: LicenceConditionOptions) => LicenceCondition = options => ({
  notes: options?.notes ?? faker.lorem.sentence(),
  mainCategory: options?.mainCategory ?? {
    code: faker.number.int({ min: 1, max: 999 }).toString(),
    description: faker.lorem.sentence(),
  },
  subCategory: options?.subCategory ?? {
    code: faker.number.int({ min: 1, max: 999 }).toString(),
    description: faker.lorem.sentence(),
  },
})

export const LicenceConditionGenerator: DataGeneratorWithSeries<LicenceCondition, LicenceConditionOptions> = {
  generate: generateInternal,
  generateSeries: optionSeries => optionSeries?.map(options => generateInternal(options)),
}
