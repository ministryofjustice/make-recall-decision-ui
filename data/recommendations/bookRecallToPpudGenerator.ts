import { fakerEN_GB as faker } from '@faker-js/faker'
import { BookRecallToPpud } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { AnyNoneOrOption, DataGenerator, IncludeNoneOrOption } from '../@generators/dataGenerators'
import CUSTODY_GROUP from '../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { resolveAnyNoneOrOption, resolveIncludeNoneOrOption } from '../@generators/dataGenerator.utils'
import { PpudSentenceDataGenerator, PpudSentenceDataOptions } from './ppudSentenceDataGenerator'
import { EthnicityGenerator, EthnicityKey } from '../common/ethnicityGenerator'
import {
  CustodyType,
  determinateCustodyTypes,
  indeterminateCustodyTypes,
} from '../../server/helpers/ppudSentence/custodyTypes'

export type BookRecallToPpudOptions = {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  prisonNumber?: string
  gender?: string
  ethnicity?: EthnicityKey
  cro?: string
  decisionDateTime?: string
  receivedDateTime?: string
  custodyGroup?: AnyNoneOrOption<CUSTODY_GROUP>
  custodyTypeBasedOnGroup?: CUSTODY_GROUP
  custodyType?: AnyNoneOrOption<CustodyType>
  changeOffenceOrAddComment?: AnyNoneOrOption<boolean>
  indexOffence?: IncludeNoneOrOption<string>
  indexOffenceComment?: IncludeNoneOrOption<string>
  ppudSentenceId?: string
  ppudIndeterminateSentenceData?: AnyNoneOrOption<PpudSentenceDataOptions>
  mappaLevel?: string
  policeForce?: string
  probationArea?: string
  sentenceDate?: IncludeNoneOrOption<Date>
  releasingPrison?: string
  currentEstablishment?: string
}

export const BookRecallToPpudGenerator: DataGenerator<BookRecallToPpud, BookRecallToPpudOptions> = {
  generate: options => {
    if (options?.custodyTypeBasedOnGroup && options?.custodyType) {
      throw new Error(
        'Both explicit Custody Type and type based on Custody Group provided. Only one or the other may be provided.',
      )
    }
    let resolvedCustodyType: CustodyType
    if (options?.custodyTypeBasedOnGroup) {
      if (options.custodyTypeBasedOnGroup === CUSTODY_GROUP.DETERMINATE) {
        resolvedCustodyType = faker.helpers.arrayElement(determinateCustodyTypes)
      } else if (options.custodyTypeBasedOnGroup === CUSTODY_GROUP.INDETERMINATE) {
        resolvedCustodyType = faker.helpers.arrayElement(indeterminateCustodyTypes)
      }
    }
    if (options?.custodyType) {
      resolvedCustodyType = resolveAnyNoneOrOption(options.custodyType, [
        ...determinateCustodyTypes,
        ...indeterminateCustodyTypes,
      ])
    }

    let legislationReleasedUnder: string = null
    let legislationSentencedUnder: string = null

    if (options?.custodyTypeBasedOnGroup === CUSTODY_GROUP.DETERMINATE) {
      legislationReleasedUnder = faker.string.alpha(10)
      legislationSentencedUnder = faker.string.alpha(10)
    }

    return {
      firstNames: options?.firstName ?? faker.person.firstName(),
      lastName: options?.lastName ?? faker.person.lastName(),
      dateOfBirth: options?.dateOfBirth ?? faker.date.past().toDateString(),
      prisonNumber: options?.prisonNumber ?? faker.string.alphanumeric(),
      gender: options?.gender ?? faker.person.gender(),
      ethnicity: EthnicityGenerator.generate(options?.ethnicity),
      cro: options?.cro ?? faker.number.int().toString(),
      decisionDateTime: options?.decisionDateTime ?? faker.date.recent().toISOString(),
      receivedDateTime: options?.receivedDateTime ?? faker.date.recent().toISOString(),
      custodyGroup: resolveAnyNoneOrOption(options?.custodyGroup ?? 'any', Object.values(CUSTODY_GROUP)),
      custodyType: resolvedCustodyType,
      changeOffenceOrAddComment: resolveAnyNoneOrOption(options?.changeOffenceOrAddComment ?? 'any', [true, false]),
      indexOffence: resolveIncludeNoneOrOption(options?.indexOffence ?? 'include', faker.lorem.words),
      indexOffenceComment: resolveIncludeNoneOrOption(options?.indexOffenceComment ?? 'include', faker.lorem.sentence),
      ppudSentenceId: options?.ppudSentenceId,
      ppudIndeterminateSentenceData: PpudSentenceDataGenerator.generate(
        options?.ppudIndeterminateSentenceData ?? 'any',
      ),
      mappaLevel: options?.mappaLevel ?? faker.number.int({ min: 1, max: 3 }).toString(),
      probationArea: options?.probationArea ?? faker.location.county(),
      policeForce: options?.policeForce ?? faker.location.county(),
      sentenceDate: resolveIncludeNoneOrOption(options?.sentenceDate, faker.date.anytime)?.toISOString(),
      legislationReleasedUnder,
      legislationSentencedUnder,
      releasingPrison: options?.releasingPrison ?? faker.location.city(),
      currentEstablishment: options?.currentEstablishment ?? faker.location.city(),
    }
  },
}
