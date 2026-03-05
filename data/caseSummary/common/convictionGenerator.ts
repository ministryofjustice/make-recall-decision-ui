import { Conviction } from '../../../server/@types/make-recall-decision-api'
import { DeliusOffenceGenerator, DeliusOffenceOptions } from './deliusOffenceGenerator'
import { SentenceGenerator, SentenceOptions } from './sentenceGenerator'
import { LicenceConditionGenerator, LicenceConditionOptions } from './licenceConvictionGenerator'
import { DataGeneratorWithSeries } from '../../@generators/dataGenerators'

export type ConvictionOptions = {
  mainOffence?: DeliusOffenceOptions
  additionalOffences?: DeliusOffenceOptions[]
  sentence?: SentenceOptions
  licenceConditions?: LicenceConditionOptions[]
}

const generateInternal = (options?: ConvictionOptions): Conviction => ({
  mainOffence: DeliusOffenceGenerator.generate(options?.mainOffence),
  additionalOffences: DeliusOffenceGenerator.generateSeries(options?.additionalOffences),
  sentence: SentenceGenerator.generate(options?.sentence),
  licenceConditions: LicenceConditionGenerator.generateSeries(options?.licenceConditions),
})

export const ConvictionGenerator: DataGeneratorWithSeries<Conviction, ConvictionOptions> = {
  generate: generateInternal,
  generateSeries: optionsSeries => optionsSeries?.map(options => generateInternal(options)),
}
