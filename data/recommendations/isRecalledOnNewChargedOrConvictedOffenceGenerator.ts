import { fakerEN_GB as faker } from '@faker-js/faker'
import { IsRecalledOnNewChargedOrConvictedOffence } from '../../server/@types/make-recall-decision-api/models/IsRecalledOnNewChargedOrConvictedOffence'
import { DataGenerator, NoneOrOption } from '../@generators/dataGenerators'
import { TextValueOptionOptions } from '../common/textValueOptionGenerator'

export type IsRecalledOnNewChargedOrConvictedOffenceOptions = {
  selected?: NoneOrOption<IsRecalledOnNewChargedOrConvictedOffence.selected>
  allOptions?: Array<TextValueOptionOptions>
}

export const isRecalledOnNewChargedOrConvictedOffenceGenerator: DataGenerator<
  IsRecalledOnNewChargedOrConvictedOffence,
  IsRecalledOnNewChargedOrConvictedOffenceOptions
> = {
  generate: (options?: IsRecalledOnNewChargedOrConvictedOffenceOptions) => {
    if (!options) {
      return {
        selected: faker.helpers.enumValue(IsRecalledOnNewChargedOrConvictedOffence.selected),
      }
    }

    return {
      selected:
        options.selected === 'none'
          ? undefined
          : (options.selected ?? faker.helpers.enumValue(IsRecalledOnNewChargedOrConvictedOffence.selected)),
    }
  },
}
