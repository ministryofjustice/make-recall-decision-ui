import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGenerator } from '../../@generators/dataGenerators'
import { ManagerRecallDecisionTypeSelectedValue } from '../../../server/@types/make-recall-decision-api/models/ManagerRecallDecisionTypeSelectedValue'

export type ManagerRecallDecisionTypeSelectedValueOptions = {
  value?: ManagerRecallDecisionTypeSelectedValue.value
  details?: string
}

export const ManagerRecallDecisionTypeSelectedValueGenerator: DataGenerator<
  ManagerRecallDecisionTypeSelectedValue,
  ManagerRecallDecisionTypeSelectedValueOptions
> = {
  generate: options => ({
    value: options?.value ?? faker.helpers.enumValue(ManagerRecallDecisionTypeSelectedValue.value),
    details: options?.details ?? faker.lorem.sentence(),
  }),
}
