import { faker } from '@faker-js/faker/locale/en_GB'
import { CodeDescriptionItem } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'

export type CodeDescriptionItemOptions = {
  code?: string
  description?: string
}

export const CodeDescriptionItemGenerator: DataGenerator<CodeDescriptionItem, CodeDescriptionItemOptions> = {
  generate: options => ({
    code: options?.code ?? faker.lorem.sentence(),
    description: options?.description ?? faker.lorem.sentence(),
  }),
}
