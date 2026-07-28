import { faker } from '@faker-js/faker/locale/en_GB'
import { TextValueOptionGenerator, TextValueOptionOptions } from '../../common/textValueOptionGenerator'
import {
  ManagerRecallDecisionTypeSelectedValueGenerator,
  ManagerRecallDecisionTypeSelectedValueOptions,
} from './managerRecallDecisionTypeSelectedValueGenerator'
import { DataGenerator } from '../../@generators/dataGenerators'
import { ManagerRecallDecision } from '../../../server/@types/make-recall-decision-api'

export type ManagerRecallDecisionOptions = {
  selected?: ManagerRecallDecisionTypeSelectedValueOptions
  allOptions?: TextValueOptionOptions[]
  isSentToDelius?: boolean
  createdBy?: string
  createdDate?: string
}

export const ManagerRecallDecisionGenerator: DataGenerator<ManagerRecallDecision, ManagerRecallDecisionOptions> = {
  generate: options => ({
    selected: ManagerRecallDecisionTypeSelectedValueGenerator.generate(options?.selected),
    allOptions: TextValueOptionGenerator.generateSeries(options?.allOptions),
    isSentToDelius: options?.isSentToDelius ?? faker.datatype.boolean(),
    createdBy: options?.createdBy ?? faker.person.fullName(),
    createdDate: options?.createdDate ?? faker.date.past().toISOString(),
  }),
}
