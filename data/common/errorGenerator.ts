import { fakerEN_GB as faker } from '@faker-js/faker'
import { DataGenerator } from '../@generators/dataGenerators'
import { NamedFormError } from '../../server/@types/pagesForms'

export type NamedFormErrorOptions = {
  name?: string
  text?: string
  href?: string
  values?: Record<string, unknown> | string
  errorId?: string
  invalidParts?: string[]
}

const NamedFormErrorGenerator: DataGenerator<NamedFormError, NamedFormErrorOptions> = {
  generate: (options: NamedFormErrorOptions): NamedFormError => {
    return {
      name: options?.name ?? faker.lorem.word(),
      text: options?.text ?? faker.lorem.sentence(),
      href: options?.href ?? faker.lorem.slug(),
      values: options?.values ?? { value1: faker.lorem.word() },
      errorId: options?.errorId ?? faker.lorem.word(),
      invalidParts: options?.invalidParts ?? [faker.lorem.sentence()],
    }
  },
}

export default NamedFormErrorGenerator
