import { taskCompleteness } from './taskCompleteness'
import recommendationResponse from '../../../../api/responses/get-recommendation.json'
import noRecallResponse from '../../../../api/responses/get-recommendation-no-recall.json'
import { IndeterminateSentenceType } from '../../../@types/make-recall-decision-api/models/IndeterminateSentenceType'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { VictimsInContactScheme } from '../../../@types/make-recall-decision-api/models/VictimsInContactScheme'
import { ObjectMap } from '../../../@types'

export const setAllProperties = (object: ObjectMap<unknown>, valueToSet: unknown) => {
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

const recallProperties: RecommendationResponse = {
  custodyStatus: undefined,
  hasContrabandRisk: undefined,
  hasVictimsInContactScheme: undefined,
  isThisAnEmergencyRecall: undefined,
  indeterminateOrExtendedSentenceDetails: undefined,
  isUnderIntegratedOffenderManagement: undefined,
  whatLedToRecall: undefined,
  vulnerabilities: undefined,
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
        isIndeterminateSentence: true,
        indeterminateSentenceType: true,
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

  describe('Multiple active convictions', () => {
    it('returns true for areAllComplete if user has no convictions and licenceConditionsBreached is null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        activeCustodialConvictionCount: 0,
        licenceConditionsBreached: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true for areAllComplete if user has multiple convictions and licenceConditionsBreached is null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        activeCustodialConvictionCount: 2,
        licenceConditionsBreached: null,
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
})
