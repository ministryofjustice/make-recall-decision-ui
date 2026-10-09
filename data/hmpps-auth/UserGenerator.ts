import { faker } from '@faker-js/faker'
import { HmppsAuthUser } from '../../server/@types/make-recall-decision-api/models/hmpps-auth/User'
import { HMPPS_AUTH_ROLE } from '../../server/middleware/authorisationMiddleware'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'

export type HmppsAuthUserOptions = {
  name?: string
  email?: string
  displayName?: string
  token?: string
  username?: string
  authSource?: string
  roles?: HMPPS_AUTH_ROLE[]
  hasSpoRole?: boolean
  hasPpcsRole?: boolean
  hasOdmRole?: boolean
}

const generateInternal = (options: HmppsAuthUserOptions): HmppsAuthUser => ({
  name: options?.name ?? faker.lorem.word(),
  email: options?.email ?? faker.internet.email(),
  displayName: options?.displayName ?? faker.lorem.word(),
  token: options?.token ?? faker.lorem.word(),
  username: options?.username ?? faker.lorem.word(),
  authSource: options?.authSource ?? faker.lorem.word(),
  roles: options?.roles ?? [faker.helpers.enumValue(HMPPS_AUTH_ROLE)],
  hasSpoRole: options?.hasSpoRole ?? faker.datatype.boolean(),
  hasPpcsRole: options?.hasPpcsRole ?? faker.datatype.boolean(),
  hasOdmRole: options?.hasOdmRole ?? faker.datatype.boolean(),
})

export const HmppsAuthUserGenerator: DataGeneratorWithSeries<HmppsAuthUser, HmppsAuthUserOptions> = {
  generate: generateInternal,
  generateSeries: optionsSeries => optionsSeries.map(o => generateInternal(o)),
}
