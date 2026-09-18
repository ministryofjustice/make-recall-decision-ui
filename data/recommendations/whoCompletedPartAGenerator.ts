import { fakerEN_GB as faker } from '@faker-js/faker'
import { AnyNoneOrOption, DataGenerator } from '../@generators/dataGenerators'
import { WhoCompletedPartA } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import jobTitleEnum from '../../server/controllers/recommendations/formOptions/jobTitle'
import regionEnum from '../../server/controllers/recommendations/formOptions/region'

export type WhoCompletedPartAOptions = {
  name?: string
  jobTitle?: string
  email?: string
  telephone?: string
  region?: string
  localDeliveryUnit?: string
  isPersonProbationPractitionerForOffender?: boolean
}

export const WhoCompletedPartAGenerator: DataGenerator<WhoCompletedPartA, AnyNoneOrOption<WhoCompletedPartAOptions>> = {
  generate: (options?: AnyNoneOrOption<WhoCompletedPartAOptions>) => {
    if (options === 'any') {
      return {
        name: faker.person.fullName(),
        jobTitle: faker.helpers.arrayElement(jobTitleEnum.filter(j => j.value !== '')).value,
        email: faker.internet.email(),
        telephone: faker.phone.number(),
        region: faker.helpers.arrayElement(regionEnum.filter(r => r.value !== '')).value,
        localDeliveryUnit: faker.location.city(),
        isPersonProbationPractitionerForOffender: faker.datatype.boolean(),
      }
    }

    if (!options || options === 'none') {
      return undefined
    }

    return {
      name: options.name,
      jobTitle: options.jobTitle,
      email: options.email,
      telephone: options.telephone,
      region: options.region,
      localDeliveryUnit: options.localDeliveryUnit,
      isPersonProbationPractitionerForOffender: options.isPersonProbationPractitionerForOffender,
    }
  },
}
