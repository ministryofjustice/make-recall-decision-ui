import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { TextValueOption } from '../../server/@types/make-recall-decision-api'

export type TextValueOptionOptions = {
  value?: string
  text?: string
}

const generateInternal = (options?: TextValueOptionOptions): TextValueOption => ({
  value: options?.value ?? faker.lorem.word(),
  text: options?.text ?? faker.lorem.sentence(),
})

export const TextValueOptionGenerator: DataGeneratorWithSeries<TextValueOption, TextValueOptionOptions> = {
  generate: generateInternal,
  generateSeries: optionsSeries => optionsSeries?.map(options => generateInternal(options)),
}
