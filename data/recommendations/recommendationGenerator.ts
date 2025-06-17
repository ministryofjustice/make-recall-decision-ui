// import { CustodyStatus, IndeterminateSentenceType, RecallTypeSelectedValue, RecommendationResponse, VictimsInContactScheme } from "../../server/@types/make-recall-decision-api";
import { fakerEN_GB as faker } from '@faker-js/faker'
import { SelectedWithDetailsGenerator, SelectedWithDetailsOptions } from '../common/selectedWithDetailsGenerator'
import { RoshEnum } from '../../server/@types/make-recall-decision-api/models/RoshData'
import { BookRecallToPpudGenerator, BookRecallToPpudOptions } from './bookRecallToPpudGenerator'
import { DataGenerator, NoneOrOption } from '../@generators/dataGenerators'
import { CustodyStatus } from '../../server/@types/make-recall-decision-api/models/CustodyStatus'
import { IndeterminateSentenceType } from '../../server/@types/make-recall-decision-api/models/IndeterminateSentenceType'
import { RecallTypeSelectedValue } from '../../server/@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { RecommendationResponse } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { VictimsInContactScheme } from '../../server/@types/make-recall-decision-api/models/VictimsInContactScheme'
import { ConvictionDetailGenerator, ConvictionDetailOptions } from './convictionDetailGenerator'
import { NomisIndexGenerator, NomisIndexOffenceOptions } from './nomisIndexOffenceGenerator'

/*
/ This is a WIP that returns only either undefined or basic random info for children based on a boolean.
/ If new data or a new type of data is required, upgrade with a child generator
/ and replace the simple boolean with the requisite options to call with
*/

export type RecommendationOptions = {
  crn?: string
  alternativesToRecallTried?: boolean
  custodyStatus?: boolean
  hasArrestIssues?: SelectedWithDetailsOptions
  hasContrabandRisk?: SelectedWithDetailsOptions
  hasVictimsInContactScheme?: boolean
  indeterminateOrExtendedSentenceDetails?: boolean
  indeterminateSentenceType?: boolean
  isExtendedSentence?: boolean
  isIndeterminateSentence?: boolean
  isMainAddressWherePersonCanBeFound?: SelectedWithDetailsOptions
  isThisAnEmergencyRecall?: boolean
  isUnderIntegratedOffenderManagement?: boolean
  licenceConditionsBreached?: boolean
  localPoliceContact?: boolean
  personOnProbation?: boolean
  convictionDetail?: ConvictionDetailOptions
  indexOffenceDetails?: boolean
  offenceAnalysis?: boolean
  previousReleases?: boolean
  previousRecalls?: boolean
  recallType?: boolean
  decisionDateTime?: boolean
  responseToProbation?: boolean
  vulnerabilities?: boolean
  triggerLeadingToRecall?: boolean
  whatLedToRecall?: boolean
  recallConsideredList?: boolean
  managerRecallDecision?: boolean
  currentRoshForPartA?: boolean
  roshSummary?: boolean
  spoCancelRecommendationRationale?: boolean
  spoDeleteRecommendationRationale?: boolean
  spoRecallType?: boolean
  whoCompletedPartA?: boolean
  practitionerForPartA?: boolean
  revocationOrderRecipients?: boolean
  ppcsQueryEmails?: boolean
  bookRecallToPpud?: BookRecallToPpudOptions
  nomisOffenceIndex?: NoneOrOption<NomisIndexOffenceOptions>
}

export const RecommendationResponseGenerator: DataGenerator<RecommendationResponse, RecommendationOptions> = {
  generate: options => ({
    id: faker.number.int({ min: 1, max: 99 }),
    status: RecommendationResponse.status.DRAFT,
    crn: options?.crn ?? faker.helpers.replaceSymbols('?######'),
    createdByUserFullName: 'Integration test data generator',
    createdBy: 'INTEGRATION_TEST_DATA_GENERATOR',
    activeCustodialConvictionCount: faker.number.int({ min: 1, max: 9 }),
    alternativesToRecallTried:
      options?.alternativesToRecallTried ?? true
        ? {
            selected: [],
            allOptions: [],
          }
        : undefined,
    custodyStatus:
      options?.custodyStatus ?? true
        ? {
            selected: CustodyStatus.selected.YES_POLICE,
            details: faker.location.streetAddress(),
            allOptions: [],
          }
        : undefined,
    dateVloInformed: faker.date.future().toDateString(),
    fixedTermAdditionalLicenceConditions: null,
    hasArrestIssues:
      options?.hasArrestIssues ?? true ? SelectedWithDetailsGenerator.generate(options?.hasArrestIssues) : undefined,
    hasContrabandRisk:
      options?.hasContrabandRisk ?? true
        ? SelectedWithDetailsGenerator.generate(options?.hasContrabandRisk)
        : undefined,
    hasVictimsInContactScheme:
      options?.hasVictimsInContactScheme ?? true
        ? {
            selected: VictimsInContactScheme.selected.YES,
            allOptions: [],
          }
        : undefined,
    indeterminateOrExtendedSentenceDetails:
      options?.indeterminateOrExtendedSentenceDetails ?? true
        ? {
            selected: [],
            allOptions: [],
          }
        : undefined,
    indeterminateSentenceType:
      options?.indeterminateSentenceType ?? true
        ? {
            selected: IndeterminateSentenceType.selected.LIFE,
            allOptions: [],
          }
        : undefined,
    isExtendedSentence: options?.isExtendedSentence ?? faker.datatype.boolean(),
    isIndeterminateSentence: options?.isIndeterminateSentence ?? faker.datatype.boolean(),
    isMainAddressWherePersonCanBeFound:
      options?.isMainAddressWherePersonCanBeFound ?? true
        ? SelectedWithDetailsGenerator.generate(options?.isMainAddressWherePersonCanBeFound)
        : undefined,
    isThisAnEmergencyRecall: options?.isThisAnEmergencyRecall ?? faker.datatype.boolean(),
    isUnderIntegratedOffenderManagement:
      options?.isUnderIntegratedOffenderManagement ?? true
        ? {
            selected: 'YES',
            allOptions: [],
          }
        : undefined,
    licenceConditionsBreached:
      options?.licenceConditionsBreached ?? true
        ? {
            standardLicenceConditions: {
              selected: [],
              allOptions: [],
            },
            additionalLicenceConditions: {
              selected: [],
              allOptions: [],
            },
          }
        : undefined,
    localPoliceContact:
      options?.localPoliceContact ?? true
        ? {
            contactName: faker.person.fullName(),
            phoneNumber: faker.phone.number(),
            faxNumber: faker.phone.number(),
            emailAddress: faker.internet.email(),
          }
        : undefined,
    personOnProbation:
      options?.personOnProbation ?? true
        ? {
            name: faker.person.fullName(),
            firstName: faker.person.firstName(),
            surname: faker.person.lastName(),
            middleNames: '',
            fullName: faker.person.fullName(),
            gender: faker.person.sex(),
            ethnicity: 'White British',
            croNumber: faker.helpers.replaceSymbols('####'),
            mostRecentPrisonerNumber: faker.helpers.replaceSymbols('###'),
            nomsNumber: faker.helpers.replaceSymbols('?#####'),
            pncNumber: faker.helpers.replaceSymbols('####/#####'),
            primaryLanguage: 'English',
            mappa: {
              level: 0,
              category: 0,
              lastUpdatedDate: faker.date.past().toDateString(),
            },
            addresses: [
              {
                line1: faker.location.streetAddress(),
                town: faker.location.city(),
                postcode: faker.location.zipCode(),
                noFixedAbode: faker.datatype.boolean(),
              },
            ],
            hasBeenReviewed: faker.datatype.boolean(),
          }
        : undefined,
    convictionDetail:
      options?.convictionDetail ?? true ? ConvictionDetailGenerator.generate(options?.convictionDetail) : undefined,
    indexOffenceDetails: options?.indexOffenceDetails ?? true ? faker.lorem.sentence() : undefined,
    offenceAnalysis: options?.offenceAnalysis ?? true ? faker.lorem.sentence() : undefined,
    previousReleases:
      options?.previousReleases ?? true
        ? {
            lastReleaseDate: faker.date.past().toDateString(),
            lastReleasingPrisonOrCustodialEstablishment: `${faker.location.city()} UT Prison`,
            hasBeenReleasedPreviously: faker.datatype.boolean(),
            previousReleaseDates: [],
          }
        : undefined,
    previousRecalls:
      options?.previousRecalls ?? true
        ? {
            lastRecallDate: faker.date.past().toDateString(),
            hasBeenRecalledPreviously: faker.datatype.boolean(),
            previousRecallDates: [],
          }
        : undefined,
    recallType:
      options?.recallType ?? true
        ? {
            selected: {
              value: RecallTypeSelectedValue.value.STANDARD,
              details: faker.lorem.sentence(),
            },
            allOptions: [],
          }
        : undefined,
    decisionDateTime: options?.decisionDateTime ?? true ? faker.date.past().toISOString() : undefined,
    responseToProbation: options?.responseToProbation ?? true ? faker.lorem.sentence() : undefined,
    vulnerabilities:
      options?.vulnerabilities ?? true
        ? {
            selected: [],
            allOptions: [],
          }
        : undefined,
    triggerLeadingToRecall: options?.triggerLeadingToRecall ?? true ? faker.lorem.word() : undefined,
    whatLedToRecall: options?.whatLedToRecall ?? true ? faker.lorem.sentence() : undefined,
    recallConsideredList: options?.recallConsideredList ?? true ? [] : undefined,
    managerRecallDecision:
      options?.managerRecallDecision ?? true
        ? {
            isSentToDelius: faker.datatype.boolean(),
          }
        : undefined,
    currentRoshForPartA:
      options?.currentRoshForPartA ?? true
        ? {
            riskToChildren: faker.helpers.enumValue(RoshEnum),
            riskToPublic: faker.helpers.enumValue(RoshEnum),
            riskToKnownAdult: faker.helpers.enumValue(RoshEnum),
            riskToStaff: faker.helpers.enumValue(RoshEnum),
            riskToPrisoners: faker.helpers.enumValue(RoshEnum),
          }
        : undefined,
    roshSummary:
      options?.roshSummary ?? true
        ? {
            lastUpdatedDate: faker.date.past().toISOString(),
            natureOfRisk: faker.lorem.sentence(),
            whoIsAtRisk: faker.lorem.word(),
            riskIncreaseFactors: faker.lorem.sentence(),
            riskMitigationFactors: faker.lorem.sentence(),
            riskImminence: faker.lorem.sentence(),
            riskOfSeriousHarm: {
              overallRisk: faker.helpers.enumValue(RoshEnum),
              riskInCommunity: {
                riskToChildren: faker.helpers.enumValue(RoshEnum),
                riskToPublic: faker.helpers.enumValue(RoshEnum),
                riskToKnownAdult: faker.helpers.enumValue(RoshEnum),
                riskToStaff: faker.helpers.enumValue(RoshEnum),
                riskToPrisoners: faker.helpers.enumValue(RoshEnum),
              },
              riskInCustody: {
                riskToChildren: faker.helpers.enumValue(RoshEnum),
                riskToPublic: faker.helpers.enumValue(RoshEnum),
                riskToKnownAdult: faker.helpers.enumValue(RoshEnum),
                riskToStaff: faker.helpers.enumValue(RoshEnum),
                riskToPrisoners: faker.helpers.enumValue(RoshEnum),
              },
            },
          }
        : undefined,
    spoCancelRecommendationRationale:
      options?.spoCancelRecommendationRationale ?? true ? faker.lorem.sentence() : undefined,
    spoDeleteRecommendationRationale:
      options?.spoDeleteRecommendationRationale ?? true ? faker.lorem.sentence() : undefined,
    spoRecallType: options?.spoRecallType ?? true ? faker.lorem.sentence() : undefined,
    whoCompletedPartA:
      options?.whoCompletedPartA ?? true
        ? {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            telephone: faker.phone.number(),
            region: faker.location.county(),
            localDeliveryUnit: faker.location.city(),
            isPersonProbationPractitionerForOffender: faker.datatype.boolean(),
          }
        : undefined,
    practitionerForPartA:
      options?.practitionerForPartA ?? true
        ? {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            telephone: faker.phone.number(),
            region: faker.location.county(),
            localDeliveryUnit: faker.location.city(),
            isPersonProbationPractitionerForOffender: faker.datatype.boolean(),
          }
        : undefined,
    revocationOrderRecipients: options?.revocationOrderRecipients ?? true ? [faker.internet.email()] : undefined,
    ppcsQueryEmails: options?.ppcsQueryEmails ?? true ? [faker.internet.email()] : undefined,
    bookRecallToPpud: BookRecallToPpudGenerator.generate(options?.bookRecallToPpud),
    nomisIndexOffence:
      options?.nomisOffenceIndex === 'none' ? undefined : NomisIndexGenerator.generate(options?.nomisOffenceIndex),
  }),
}
