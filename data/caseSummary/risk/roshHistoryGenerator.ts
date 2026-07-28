import { faker } from '@faker-js/faker/locale/en_GB'
import { RoshHistory } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'
import { RegistrationGenerator, RegistrationOptions } from './registrationGenerator'

export type RoshHistoryOptions = {
  registrations?: Array<RegistrationOptions>
  error?: string
}

export const RoshHistoryGenerator: DataGenerator<RoshHistory, RoshHistoryOptions> = {
  generate: options => ({
    registrations: options?.registrations ?? [RegistrationGenerator.generate()],
    error: options?.error ?? faker.lorem.sentence(),
  }),
}
