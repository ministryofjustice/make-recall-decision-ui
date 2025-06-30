import { faker } from '@faker-js/faker'
import { Term } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGeneratorWithSeries, IncludeNoneOrOption } from '../@generators/dataGenerators'

type ChronosOptions = {
  years?: IncludeNoneOrOption<number>
  months?: IncludeNoneOrOption<number>
  weeks?: IncludeNoneOrOption<number>
  days?: IncludeNoneOrOption<number>
}
export type TermOptions = {
  chronos?: 'all' | ChronosOptions
  code?: string
}

const generateInternal = (options?: TermOptions): Term => ({
  years: resolve(options.chronos, co => co?.years, 5),
  months: resolve(options.chronos, co => co?.months, 11),
  weeks: resolve(options.chronos, co => co?.weeks, 3),
  days: resolve(options.chronos, co => co?.days, 6),
  code: options?.code ? options.code : 'Unit terms term',
})

const resolve = (
  options: 'all' | ChronosOptions,
  selector: (co: ChronosOptions) => IncludeNoneOrOption<number>,
  maxValue: number
) => {
  const chronoValue = selector(options !== 'all' ? options : undefined)
  if (options === 'all' || chronoValue === 'include' || chronoValue === undefined) {
    return faker.number.int({ min: 1, max: maxValue })
  }
  if (chronoValue === 'none') {
    return undefined
  }
  return chronoValue
}

export const TermGenerator: DataGeneratorWithSeries<Term, TermOptions> = {
  generate: options => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(option => generateInternal(option)),
}
