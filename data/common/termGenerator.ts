import { faker } from '@faker-js/faker'
import { Term } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'

export type TermOptions =
  | 'all'
  | {
      years?: 'include' | number
      months?: 'include' | number
      weeks?: 'include' | number
      days?: 'include' | number
      code?: string
    }

const generateInternal = (options?: TermOptions): Term => ({
  years:
    options === 'all' || options?.years === 'include' || options?.years === undefined
      ? faker.number.int({ min: 1, max: 5 })
      : options.years,
  months:
    options === 'all' || options?.months === 'include' || options?.months === undefined
      ? faker.number.int({ min: 1, max: 11 })
      : options.months,
  weeks:
    options === 'all' || options?.weeks === 'include' || options?.weeks === undefined
      ? faker.number.int({ min: 1, max: 3 })
      : options.weeks,
  days:
    options === 'all' || options?.days === 'include' || options?.days === undefined
      ? faker.number.int({ min: 1, max: 6 })
      : options.days,
  code: options !== 'all' && options?.code ? options.code : 'Unit terms term',
})

export const TermGenerator: DataGeneratorWithSeries<Term, TermOptions> = {
  generate: options => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(option => generateInternal(option)),
}
