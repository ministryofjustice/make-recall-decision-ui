import { fakerEN_GB as faker } from '@faker-js/faker'
import { AnyNoneOrOption, DataGenerator } from '../@generators/dataGenerators'
import { Mappa } from '../../server/@types/make-recall-decision-api'

export type MappaOptions = {
  level?: number
  lastUpdatedDate?: string
  category?: number
  error?: string
  hasBeenReviewed?: boolean
}

export const mappaGenerator: DataGenerator<Mappa, AnyNoneOrOption<MappaOptions>> = {
  generate: (options?: AnyNoneOrOption<MappaOptions>) => {
    if (options === 'any') {
      return {
        level: 0,
        category: 0,
        lastUpdatedDate: faker.date.past().toDateString(),
      }
    }

    if (!options || options === 'none') {
      return undefined
    }

    return {
      level: options.level,
      lastUpdatedDate: options.lastUpdatedDate,
      category: options.category,
      error: options.error,
      hasBeenReviewed: options.hasBeenReviewed,
    }
  },
}
