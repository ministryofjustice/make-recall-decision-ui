import { fakerEN_GB as faker } from '@faker-js/faker'
import { DataGenerator, NoneOrOption } from '../../@generators/dataGenerators'
import { PpudUserMappingFull } from '../../../server/@types/make-recall-decision-api/models/PpudUserMappingFull'

export type PpudUserMappingFullOptions = {
  id?: NoneOrOption<string>
  userName?: NoneOrOption<string>
  ppudUserFullName?: NoneOrOption<string>
  ppudTeamName?: NoneOrOption<string>
  ppudUserName?: NoneOrOption<string>
}

export const PpudUserMappingFullGenerator: DataGenerator<PpudUserMappingFull, PpudUserMappingFullOptions> = {
  generate: (options: PpudUserMappingFullOptions): PpudUserMappingFull => {
    return {
      id: options?.id === 'none' ? undefined : (options?.id ?? faker.number.int({ min: 1, max: 1000 }).toString()),
      userName: options?.userName === 'none' ? undefined : (options?.userName ?? faker.internet.username()),
      ppudUserFullName:
        options?.ppudUserFullName === 'none' ? undefined : (options?.ppudUserFullName ?? faker.person.fullName()),
      ppudTeamName: options?.ppudTeamName === 'none' ? undefined : (options?.ppudTeamName ?? faker.company.name()),
      ppudUserName: options?.ppudUserName === 'none' ? undefined : (options?.ppudUserName ?? faker.internet.username()),
    }
  },
}
