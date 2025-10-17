import { fakerEN_GB as faker } from '@faker-js/faker'
import type {
  TextValueOption,
  ValueWithDetails,
  VulnerabilitiesRecommendation,
} from '../../server/@types/make-recall-decision-api'
import { AnyNoneOrOption, DataGenerator } from '../@generators/dataGenerators'

export type VulnerabilitiesOptions = {
  selected?: Array<ValueWithDetails>
  allOptions?: Array<TextValueOption>
}

export const VulnerabilitiesGenerator: DataGenerator<
  VulnerabilitiesRecommendation,
  AnyNoneOrOption<VulnerabilitiesOptions>
> = {
  generate: (options?: AnyNoneOrOption<VulnerabilitiesOptions>) => {
    if (options === 'any') {
      return {
        selected: [{ value: faker.lorem.sentence(), details: faker.lorem.sentence() }],
        allOptions: [
          { value: faker.lorem.sentence(), details: faker.lorem.sentence() },
          { value: faker.lorem.sentence(), details: faker.lorem.sentence() },
        ],
      }
    }

    if (!options || options === 'none') {
      return undefined
    }

    return {
      selected: options.selected,
      allOptions: options.allOptions,
    }
  },
}
