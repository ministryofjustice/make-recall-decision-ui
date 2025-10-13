import { fakerEN_GB as faker } from '@faker-js/faker'
import { RecallType } from '../../server/@types/make-recall-decision-api/models/RecallType'
import { RecallTypeSelectedValue } from '../../server/@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { AnyNoneOrOption, DataGenerator } from '../@generators/dataGenerators'

export type RecallTypeOptions = {
  selected: {
    value?: RecallTypeSelectedValue.value
    details?: string
  }
}

export const RecallTypeGenerator: DataGenerator<RecallType, AnyNoneOrOption<RecallTypeOptions>> = {
  generate: (options?: AnyNoneOrOption<RecallTypeOptions>) => {
    if (options === 'any') {
      return {
        selected: {
          value: faker.helpers.enumValue(RecallTypeSelectedValue.value),
          details: faker.lorem.sentence(),
        },
        allOptions: [],
      }
    }
    if (!options || options === 'none') {
      return undefined
    }
    return {
      selected: {
        value: options.selected.value,
        details: options.selected.details,
      },
    }
  },
}
