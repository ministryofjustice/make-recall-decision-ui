import { taskCompleteness } from './taskCompleteness'
import recommendationResponse from '../../../../api/responses/get-recommendation.json'
import noRecallResponse from '../../../../api/responses/get-recommendation-no-recall.json'
import { IndeterminateSentenceType } from '../../../@types/make-recall-decision-api/models/IndeterminateSentenceType'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { VictimsInContactScheme } from '../../../@types/make-recall-decision-api/models/VictimsInContactScheme'

export const setAllProperties = (object: Record<string, unknown>, valueToSet: unknown) => {
  const copy = { ...object }
  Object.keys(object).forEach(key => {
    copy[key] = valueToSet
  })
  return copy
}

const sharedProperties: RecommendationResponse = {
  alternativesToRecallTried: undefined,
  isIndeterminateSentence: undefined,
  isExtendedSentence: undefined,
  licenceConditionsBreached: undefined,
  recallType: undefined,
  responseToProbation: undefined,
}

const recallProperties: RecommendationResponse & { mappa?: boolean } = {
  custodyStatus: undefined,
  hasContrabandRisk: undefined,
  hasVictimsInContactScheme: undefined,
  isThisAnEmergencyRecall: undefined,
  indeterminateOrExtendedSentenceDetails: undefined,
  isUnderIntegratedOffenderManagement: undefined,
  personOnProbation: undefined,
  whatLedToRecall: undefined,
  vulnerabilities: undefined,
  convictionDetail: undefined,
  offenceAnalysis: undefined,
  mappa: undefined,
  currentRoshForPartA: undefined,
  previousReleases: undefined,
  previousRecalls: undefined,
  fixedTermAdditionalLicenceConditions: undefined,
  hasArrestIssues: undefined,
  isMainAddressWherePersonCanBeFound: undefined,
  localPoliceContact: undefined,
}

const indeterminateSentenceProperties: RecommendationResponse = {
  indeterminateSentenceType: undefined,
}

const noRecallProperties: RecommendationResponse = {
  whyConsideredRecall: undefined,
  reasonsForNoRecall: undefined,
  nextAppointment: undefined,
}

const emptyRecall: RecommendationResponse = {
  ...setAllProperties(sharedProperties, null),
  ...setAllProperties(recallProperties, null),
  activeCustodialConvictionCount: 1,
  recallType: { selected: { value: RecallTypeSelectedValue.value.STANDARD } },
  isIndeterminateSentence: true,
}

describe('taskCompleteness', () => {
  describe('Recall', () => {
    it('all complete', () => {
      const { statuses, areAllComplete } = taskCompleteness(recommendationResponse as RecommendationResponse)
      expect(statuses).toEqual({
        ...setAllProperties(sharedProperties, true),
        ...setAllProperties(recallProperties, true),
        ...setAllProperties(indeterminateSentenceProperties, true),
        didProbationPractitionerCompletePartA: true,
        whoCompletedPartA: false,
        practitionerForPartA: false,
      })
      expect(areAllComplete).toEqual(true)
    })

    it('indeterminate sentence - partly complete', () => {
      const { statuses, areAllComplete } = taskCompleteness(emptyRecall)
      expect(statuses).toEqual({
        ...setAllProperties(sharedProperties, false),
        ...setAllProperties(recallProperties, false),
        ...setAllProperties(indeterminateSentenceProperties, false),
        isIndeterminateSentence: true,
        recallType: true,
        fixedTermAdditionalLicenceConditions: true,
        hasArrestIssues: true,
        isMainAddressWherePersonCanBeFound: true,
        localPoliceContact: true,
        didProbationPractitionerCompletePartA: true,
        whoCompletedPartA: false,
        practitionerForPartA: false,
      })
      expect(areAllComplete).toEqual(false)
    })
  })

  describe('No recall', () => {
    it('all complete', () => {
      const { statuses, areAllComplete } = taskCompleteness(noRecallResponse as RecommendationResponse)
      expect(statuses).toEqual({
        ...setAllProperties(sharedProperties, true),
        ...setAllProperties(indeterminateSentenceProperties, true),
        ...setAllProperties(noRecallProperties, true),
        previousRecalls: false,
        previousReleases: false,
      })
      expect(areAllComplete).toEqual(true)
    })

    it('all complete - sentence type not required if indeterminate is false', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...noRecallResponse,
        isIndeterminateSentence: false,
        indeterminateSentenceType: undefined,
      } as RecommendationResponse)
      expect(statuses).toEqual({
        ...setAllProperties(sharedProperties, true),
        ...setAllProperties(noRecallProperties, true),
        previousRecalls: false,
        previousReleases: false,
        indeterminateSentenceType: false,
      })
      expect(areAllComplete).toEqual(true)
    })

    const emptyNoRecall: RecommendationResponse = {
      ...setAllProperties(sharedProperties, null),
      ...setAllProperties(noRecallProperties, null),
      activeCustodialConvictionCount: 1,
      recallType: { selected: { value: RecallTypeSelectedValue.value.NO_RECALL } },
    }

    it('all incomplete', () => {
      const { statuses, areAllComplete } = taskCompleteness(emptyNoRecall as RecommendationResponse)
      expect(statuses).toEqual({
        ...setAllProperties(sharedProperties, false),
        ...setAllProperties(noRecallProperties, false),
        recallType: true,
        previousRecalls: false,
        previousReleases: false,
        indeterminateSentenceType: false,
      })
      expect(areAllComplete).toEqual(false)
    })

    it('whyConsideredRecall incomplete', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...emptyNoRecall,
        reasonsForNoRecall: {},
        nextAppointment: {},
      } as RecommendationResponse)
      expect(statuses.whyConsideredRecall).toEqual(false)
      expect(areAllComplete).toEqual(false)
    })

    it('nextAppointment incomplete', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...emptyNoRecall,
        reasonsForNoRecall: {},
        whyConsideredRecall: {},
      } as RecommendationResponse)
      expect(statuses.nextAppointment).toEqual(false)
      expect(areAllComplete).toEqual(false)
    })

    it('reasonsForNoRecall incomplete', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...emptyNoRecall,
        nextAppointment: {},
        whyConsideredRecall: {},
      } as RecommendationResponse)
      expect(statuses.reasonsForNoRecall).toEqual(false)
      expect(areAllComplete).toEqual(false)
    })
  })

  describe('Licence conditions', () => {
    it('returns true if a standard licence condition is selected', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        licenceConditionsBreached: {
          standardLicenceConditions: {
            selected: ['GOOD_BEHAVIOUR', 'NO_OFFENCE'],
          },
          additionalLicenceConditions: {
            selectedOptions: [],
          },
        },
      } as RecommendationResponse)
      expect(statuses.licenceConditionsBreached).toEqual(true)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true if an additional licence condition is selected', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        licenceConditionsBreached: {
          standardLicenceConditions: {},
          additionalLicenceConditions: {
            selectedOptions: [
              {
                mainCatCode: 'NLC5',
                subCatCode: 'NST14',
              },
            ],
          },
        },
      } as RecommendationResponse)
      expect(statuses.licenceConditionsBreached).toEqual(true)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true if a standard cvl licence condition is selected', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        cvlLicenceConditionsBreached: {
          standardLicenceConditions: {
            selected: ['1', '2'],
            allOptions: [],
          },
        },
      } as RecommendationResponse)
      expect(statuses.licenceConditionsBreached).toEqual(true)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true if a additional cvl licence condition is selected', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        cvlLicenceConditionsBreached: {
          additionalLicenceConditions: {
            selected: ['1', '2'],
            allOptions: [],
          },
        },
      } as RecommendationResponse)
      expect(statuses.licenceConditionsBreached).toEqual(true)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true if a bespoke cvl licence condition is selected', () => {
      const { statuses, areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        cvlLicenceConditionsBreached: {
          bespokeLicenceConditions: {
            selected: ['1', '2'],
            allOptions: [],
          },
        },
      } as RecommendationResponse)
      expect(statuses.licenceConditionsBreached).toEqual(true)
      expect(areAllComplete).toEqual(true)
    })
  })

  describe('Custody status', () => {
    it('returns false for areAllComplete if not in custody, and related properties are null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: null,
        localPoliceContact: null,
        isMainAddressWherePersonCanBeFound: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns false for areAllComplete if not in custody, and others not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: null,
        isMainAddressWherePersonCanBeFound: null,
        localPoliceContact: {},
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns false for areAllComplete if not in custody, and localPoliceContact not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: { selected: true, details: 'details' },
        isMainAddressWherePersonCanBeFound: { selected: true, details: 'details' },
        localPoliceContact: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns true for areAllComplete if not in custody, and related properties are all set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: { selected: false },
        isMainAddressWherePersonCanBeFound: { selected: true, details: 'details' },
        localPoliceContact: {
          contactName: 'Bob',
        },
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true for areAllComplete if in police custody, and related properties are null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'YES_POLICE' },
        hasArrestIssues: null,
        localPoliceContact: null,
        isMainAddressWherePersonCanBeFound: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true for areAllComplete if in prison custody, and related properties are null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'YES_PRISON' },
        hasArrestIssues: null,
        localPoliceContact: null,
        isMainAddressWherePersonCanBeFound: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })
  })

  describe('Victim contact scheme', () => {
    it('returns true if hasVictimsInContactScheme is Yes and VLO date set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        hasVictimsInContactScheme: { selected: 'YES' as VictimsInContactScheme.selected },
        dateVloInformed: '2022-09-05',
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(true)
    })

    it('returns false if hasVictimsInContactScheme is Yes and VLO date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        hasVictimsInContactScheme: { selected: 'YES' as VictimsInContactScheme.selected },
        dateVloInformed: null,
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(false)
    })

    it('returns true if hasVictimsInContactScheme is No and VLO date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        hasVictimsInContactScheme: { selected: 'NO' as VictimsInContactScheme.selected },
        dateVloInformed: null,
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(true)
    })

    it('returns true if hasVictimsInContactScheme is Not applicable and VLO date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        hasVictimsInContactScheme: { selected: 'NOT_APPLICABLE' as VictimsInContactScheme.selected },
        dateVloInformed: null,
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(true)
    })
  })

  describe('Previous releases', () => {
    it('returns true if hasBeenReleasedPreviously is true and previous release date set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        previousReleases: { hasBeenReleasedPreviously: true, previousReleaseDates: ['2022-09-05'] },
      })
      expect(statuses.previousReleases).toEqual(true)
    })

    it('returns false if hasBeenReleasedPreviously is true and previous release date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        previousReleases: { hasBeenReleasedPreviously: true },
      })
      expect(statuses.previousReleases).toEqual(false)
    })

    it('returns true if hasBeenReleasedPreviously is false and previous release date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        previousReleases: { hasBeenReleasedPreviously: false },
      })
      expect(statuses.previousReleases).toEqual(true)
    })
  })

  describe('Previous recalls', () => {
    it('returns true if hasBeenRecalledPreviously is true and previous release date set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        previousRecalls: { hasBeenRecalledPreviously: true, previousRecallDates: ['2022-09-05'] },
      })
      expect(statuses.previousRecalls).toEqual(true)
    })

    it('returns false if hasBeenRecalledPreviously is true and previous release date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        previousRecalls: { hasBeenRecalledPreviously: true },
      })
      expect(statuses.previousRecalls).toEqual(false)
    })

    it('returns true if hasBeenRecalledPreviously is false and previous release date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecall,
        previousRecalls: { hasBeenRecalledPreviously: false },
      })
      expect(statuses.previousRecalls).toEqual(true)
    })
  })

  describe('Indeterminate sentence type', () => {
    it('returns true if isIndeterminateSentence is true and indeterminateSentenceType set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: true,
        indeterminateSentenceType: {
          selected: 'LIFE' as IndeterminateSentenceType.selected,
        },
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true if isIndeterminateSentence is false and indeterminateSentenceType not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: false,
        indeterminateSentenceType: null,
        fixedTermAdditionalLicenceConditions: {}, // the default recommendation doesn't have this set
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns false if isIndeterminateSentence is true and indeterminateSentenceType is not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: true,
        indeterminateSentenceType: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })
  })

  describe('Indeterminate or extended details', () => {
    it('returns true if isIndeterminateSentence is true and indeterminateOrExtendedSentenceDetails set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: true,
        indeterminateOrExtendedSentenceDetails: {
          selected: [{ value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE', details: 'Details' }],
        },
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns false if isIndeterminateSentence is true and indeterminateOrExtendedSentenceDetails is not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: true,
        indeterminateOrExtendedSentenceDetails: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns true if isIndeterminateSentence is false and indeterminateOrExtendedSentenceDetails is not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: false,
        indeterminateOrExtendedSentenceDetails: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })
  })

  describe('Fixed term licence conditions', () => {
    it('returns true if isIndeterminateSentence is false and fixedTermAdditionalLicenceConditions set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: false,
        fixedTermAdditionalLicenceConditions: {
          selected: true,
        },
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true if isIndeterminateSentence is true and fixedTermAdditionalLicenceConditions not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: true,
        fixedTermAdditionalLicenceConditions: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true if isIndeterminateSentence is false, recall type is standard and fixedTermAdditionalLicenceConditions not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: false,
        fixedTermAdditionalLicenceConditions: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns false if isIndeterminateSentence is false, recall type is fixed and fixedTermAdditionalLicenceConditions not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        recallType: { selected: { value: 'FIXED_TERM' } },
        isIndeterminateSentence: false,
        fixedTermAdditionalLicenceConditions: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns true if isIndeterminateSentence is false, extended sentence is true and indeterminate sentence type not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        isIndeterminateSentence: false,
        isExtendedSentence: true,
        indeterminateSentenceType: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })
  })
  describe('Contact Information', () => {
    it('returns false if who has completed Part A has not been supplied', () => {
      const { areAllComplete, statuses } = taskCompleteness(
        {
          ...recommendationResponse,
        } as RecommendationResponse,
        { flagProbationAdmin: true }
      )

      expect(statuses.whoCompletedPartA).toEqual(false)
      expect(statuses.didProbationPractitionerCompletePartA).toEqual(true)
      expect(areAllComplete).toEqual(false)
    })
    it('returns true if the person who completed the part A is the probation practitioner', () => {
      const { areAllComplete, statuses } = taskCompleteness(
        {
          ...recommendationResponse,
          whoCompletedPartA: {
            isPersonProbationPractitionerForOffender: true,
          },
        } as RecommendationResponse,
        { flagProbationAdmin: true }
      )

      expect(statuses.whoCompletedPartA).toEqual(true)
      expect(statuses.didProbationPractitionerCompletePartA).toEqual(true)
      expect(areAllComplete).toEqual(true)
    })
    it('returns true if the person who completed the part A is not the probation practitioner and that section has been supplied', () => {
      const { areAllComplete, statuses } = taskCompleteness(
        {
          ...recommendationResponse,
          whoCompletedPartA: {
            isPersonProbationPractitionerForOffender: false,
          },
          practitionerForPartA: {},
        } as RecommendationResponse,
        { flagProbationAdmin: true }
      )

      expect(statuses.whoCompletedPartA).toEqual(true)
      expect(statuses.practitionerForPartA).toEqual(true)
      expect(statuses.didProbationPractitionerCompletePartA).toEqual(false)
      expect(areAllComplete).toEqual(true)
    })
    it('returns false if the person who completed the part A is not the probation practitioner and that section has not been supplied', () => {
      const { areAllComplete, statuses } = taskCompleteness(
        {
          ...recommendationResponse,
          whoCompletedPartA: {
            isPersonProbationPractitionerForOffender: false,
          },
        } as RecommendationResponse,
        { flagProbationAdmin: true }
      )

      expect(statuses.whoCompletedPartA).toEqual(true)
      expect(statuses.practitionerForPartA).toEqual(false)
      expect(statuses.didProbationPractitionerCompletePartA).toEqual(false)
      expect(areAllComplete).toEqual(false)
    })
  })
})
