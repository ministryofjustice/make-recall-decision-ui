import { faker } from '@faker-js/faker'
import { SelectedWithDetails } from '../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../@generators/dataGenerators'

export type SelectedWithDetailsOptions = {
  selected?: boolean
  details?: string
}

export const SelectedWithDetailsGenerator: DataGenerator<SelectedWithDetails, SelectedWithDetailsOptions> = {
  generate: options => ({
    selected: options?.selected ?? faker.datatype.boolean(),
    details: options?.details ?? faker.lorem.sentence(),
  }),
}
