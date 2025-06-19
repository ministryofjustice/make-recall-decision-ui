import { faker } from '@faker-js/faker'
import { Term } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGeneratorWithSeries, IncludeNoneOrOption } from '../@generators/dataGenerators'

export type TermOptions = {
  chronos?:
    | 'all'
    | {
        years?: IncludeNoneOrOption<number>
        months?: IncludeNoneOrOption<number>
        weeks?: IncludeNoneOrOption<number>
        days?: IncludeNoneOrOption<number>
      }
  code?: string
}

const generateInternal = (options?: TermOptions): Term => ({
  years: resolveYears(options),
  months: resolveMonths(options),
  weeks: resolveWeeks(options),
  days: resolveDays(options),
  code: options?.code ? options.code : 'Unit terms term',
})

const resolveYears = (options: TermOptions) => {
  if (options?.chronos === 'all' || options?.chronos?.years === 'include' || options?.chronos?.years === undefined) {
    return faker.number.int({ min: 1, max: 5 })
  }
  if (options?.chronos?.years === 'none') {
    return undefined
  }
  return options.chronos.years
}

const resolveMonths = (options: TermOptions) => {
  if (options?.chronos === 'all' || options?.chronos?.months === 'include' || options?.chronos?.months === undefined) {
    return faker.number.int({ min: 1, max: 12 })
  }
  if (options?.chronos?.months === 'none') {
    return undefined
  }
  return options.chronos.months
}

const resolveWeeks = (options: TermOptions) => {
  if (options?.chronos === 'all' || options?.chronos?.weeks === 'include' || options?.chronos?.weeks === undefined) {
    return faker.number.int({ min: 1, max: 3 })
  }
  if (options?.chronos?.weeks === 'none') {
    return undefined
  }
  return options.chronos.weeks
}

const resolveDays = (options: TermOptions) => {
  if (options?.chronos === 'all' || options?.chronos?.days === 'include' || options?.chronos?.days === undefined) {
    return faker.number.int({ min: 1, max: 6 })
  }
  if (options?.chronos?.days === 'none') {
    return undefined
  }
  return options.chronos.days
}

export const TermGenerator: DataGeneratorWithSeries<Term, TermOptions> = {
  generate: options => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(option => generateInternal(option)),
}
