import { faker } from '@faker-js/faker'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { RecommendationStatusResponse } from '../../server/@types/make-recall-decision-api/models/RecommendationStatusReponse'

export type RecommendationStatusResponseOptions = {
  name?: string
  active?: boolean
  recommendationId?: string
  createdBy?: string
  created?: string
  modifiedBy?: string
  modified?: string
  createdByUserFullName?: string
  modifiedByUserFullName?: string
  emailAddress?: string
}

const generateInternal = (options: RecommendationStatusResponseOptions) => ({
  name: options?.name ?? faker.lorem.word(),
  active: options?.active ?? faker.datatype.boolean(),
  recommendationId: options?.recommendationId ?? faker.number.int().toString(),
  createdBy: options?.createdBy ?? faker.person.firstName(),
  created: options?.created ?? faker.date.past().toISOString(),
  modifiedBy: options?.modifiedBy ?? faker.person.firstName(),
  modified: options?.modified ?? faker.date.past().toISOString(),
  createdByUserFullName: options?.createdByUserFullName ?? faker.person.fullName(),
  modifiedByUserFullName: options?.modifiedByUserFullName ?? faker.person.fullName(),
  emailAddress: options?.emailAddress ?? faker.internet.email(),
})

export const RecommendationStatusResponseGenerator: DataGeneratorWithSeries<
  RecommendationStatusResponse,
  RecommendationStatusResponseOptions
> = {
  generate: generateInternal,
  generateSeries: optionsSeries => optionsSeries.map(o => generateInternal(o)),
}
