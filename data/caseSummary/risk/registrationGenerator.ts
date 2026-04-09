import { faker } from '@faker-js/faker/locale/en_GB'
import { Registration } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'
import { CodeDescriptionItemGenerator, CodeDescriptionItemOptions } from './codeDescriptionItemGenerator'

export type RegistrationOptions = {
  registrationId?: string
  active?: boolean
  register?: CodeDescriptionItemOptions
  type?: CodeDescriptionItemOptions
  startDate?: string
  notes?: string
}

export const RegistrationGenerator: DataGenerator<Registration, RegistrationOptions> = {
  generate: options => ({
    registrationId: options?.registrationId ?? faker.lorem.slug(),
    active: options?.active ?? faker.datatype.boolean(),
    register: options?.register ?? CodeDescriptionItemGenerator.generate(),
    type: options?.type ?? CodeDescriptionItemGenerator.generate(),
    startDate: options?.startDate ?? faker.date.future().toISOString(),
    notes: options?.notes ?? faker.lorem.sentence(),
  }),
}
