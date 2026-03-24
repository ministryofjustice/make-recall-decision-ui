import { fakerEN_GB as faker } from '@faker-js/faker'
import { CustodyStatus } from '../../server/@types/make-recall-decision-api/models/CustodyStatus'
import { TextValueOptionGenerator, TextValueOptionOptions } from '../common/textValueOptionGenerator'
import { DataGenerator } from '../@generators/dataGenerators'

export type CustodyStatusOptions = {
  selected?: CustodyStatus.selected
  details?: string
  allOptions?: Array<TextValueOptionOptions>
}

export const CustodyStatusGenerator: DataGenerator<CustodyStatus, CustodyStatusOptions> = {
  generate: (options?: CustodyStatusOptions) => {
    if (!options) {
      return {
        selected: faker.helpers.enumValue(CustodyStatus.selected),
        details: faker.location.streetAddress(),
        allOptions: [],
      }
    }
    return {
      selected: options.selected ?? faker.helpers.enumValue(CustodyStatus.selected),
      details: options.details ?? faker.location.streetAddress(),
      allOptions: (options.allOptions && TextValueOptionGenerator.generateSeries(options.allOptions)) ?? [],
    }
  },
}
