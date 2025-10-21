import { fakerEN_GB as faker } from '@faker-js/faker'
import { AnyNoneOrOption, DataGenerator } from '../@generators/dataGenerators'
import { WhoCompletedPartA } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'

export type WhoCompletedPartAOptions = {
  name?: string
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
        email: faker.internet.email(),
        telephone: faker.phone.number(),
        region: faker.location.county(),
        localDeliveryUnit: faker.location.city(),
        isPersonProbationPractitionerForOffender: faker.datatype.boolean(),
      }
    }

    if (!options || options === 'none') {
      return undefined
    }

    return {
      name: options.name,
      email: options.email,
      telephone: options.telephone,
      region: options.region,
      localDeliveryUnit: options.localDeliveryUnit,
      isPersonProbationPractitionerForOffender: options.isPersonProbationPractitionerForOffender,
    }
  },
}
