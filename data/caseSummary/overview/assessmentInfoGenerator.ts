import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGenerator } from '../../@generators/dataGenerators'
import { AssessmentInfo } from '../../../server/@types/make-recall-decision-api'

export type AssessmentInfoOptions = {
  error?: string
  lastUpdatedDate?: string
  offenceDataFromLatestCompleteAssessment?: boolean
  offencesMatch?: boolean
  offenceDescription?: string
}

export const AssessmentInfoGenerator: DataGenerator<AssessmentInfo, AssessmentInfoOptions> = {
  generate: options => ({
    error: options?.error ?? faker.lorem.sentence(),
    lastUpdatedDate: options?.lastUpdatedDate ?? faker.date.past().toISOString(),
    offenceDataFromLatestCompleteAssessment:
      options?.offenceDataFromLatestCompleteAssessment ?? faker.datatype.boolean(),
    offencesMatch: options?.offencesMatch ?? faker.datatype.boolean(),
    offenceDescription: options?.offenceDescription ?? faker.lorem.sentence(),
  }),
}
