import { taskCompleteness } from './taskCompleteness'
import recommendationResponse from '../../../../api/responses/get-recommendation.json'
import { RecommendationResponse, VictimsInContactScheme } from '../../../@types/make-recall-decision-api'

describe('taskCompleteness', () => {
  it('returns Complete statuses, and areAllComplete is true', () => {
    const { statuses, areAllComplete } = taskCompleteness(recommendationResponse as RecommendationResponse)
    expect(statuses).toEqual({
      alternativesToRecallTried: true,
      custodyStatus: true,
      hasArrestIssues: true,
      hasContrabandRisk: true,
      hasVictimsInContactScheme: true,
      isThisAnEmergencyRecall: true,
      isExtendedOrIndeterminateSentence: true,
      isUnderIntegratedOffenderManagement: true,
      licenceConditionsBreached: true,
      localPoliceContact: true,
      recallType: true,
      responseToProbation: true,
      whatLedToRecall: true,
      vulnerabilities: true,
    })
    expect(areAllComplete).toEqual(true)
  })

  const emptyRecommendation: RecommendationResponse = {
    alternativesToRecallTried: null,
    custodyStatus: null,
    hasArrestIssues: null,
    hasContrabandRisk: null,
    hasVictimsInContactScheme: null,
    isThisAnEmergencyRecall: null,
    isExtendedOrIndeterminateSentence: null,
    isUnderIntegratedOffenderManagement: null,
    licenceConditionsBreached: null,
    localPoliceContact: null,
    recallType: null,
    responseToProbation: null,
    whatLedToRecall: null,
    vulnerabilities: null,
  }

  it('returns To do statuses, and areAllComplete is false', () => {
    const { statuses, areAllComplete } = taskCompleteness(emptyRecommendation)
    expect(statuses).toEqual({
      alternativesToRecallTried: false,
      custodyStatus: false,
      hasArrestIssues: false,
      hasContrabandRisk: false,
      hasVictimsInContactScheme: false,
      isThisAnEmergencyRecall: false,
      isExtendedOrIndeterminateSentence: false,
      isUnderIntegratedOffenderManagement: false,
      licenceConditionsBreached: false,
      localPoliceContact: false,
      recallType: false,
      responseToProbation: false,
      whatLedToRecall: false,
      vulnerabilities: false,
    })
    expect(areAllComplete).toEqual(false)
  })

  describe('Custody status', () => {
    it('returns false for areAllComplete if not in custody, and hasArrestIssues / localPoliceContact are null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: null,
        localPoliceContact: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns false for areAllComplete if not in custody, and hasArrestIssues not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: null,
        localPoliceContact: {},
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns false for areAllComplete if not in custody, and localPoliceContact not set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: 'details',
        localPoliceContact: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(false)
    })

    it('returns true for areAllComplete if not in custody, and hasArrestIssues / localPoliceContact are both set', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'NO' },
        hasArrestIssues: 'details',
        localPoliceContact: {},
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true for areAllComplete if in police custody, and hasArrestIssues / localPoliceContact are null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'YES_POLICE' },
        hasArrestIssues: null,
        localPoliceContact: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })

    it('returns true for areAllComplete if in prison custody, and hasArrestIssues / localPoliceContact are null', () => {
      const { areAllComplete } = taskCompleteness({
        ...recommendationResponse,
        custodyStatus: { selected: 'YES_PRISON' },
        hasArrestIssues: null,
        localPoliceContact: null,
      } as RecommendationResponse)
      expect(areAllComplete).toEqual(true)
    })
  })

  describe('Victim contact scheme', () => {
    it('returns true if hasVictimsInContactScheme is Yes and VLO date set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecommendation,
        hasVictimsInContactScheme: { selected: 'YES' as VictimsInContactScheme.selected },
        dateVloInformed: '2022-09-05',
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(true)
    })

    it('returns false if hasVictimsInContactScheme is Yes and VLO date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecommendation,
        hasVictimsInContactScheme: { selected: 'YES' as VictimsInContactScheme.selected },
        dateVloInformed: null,
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(false)
    })

    it('returns true if hasVictimsInContactScheme is No and VLO date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecommendation,
        hasVictimsInContactScheme: { selected: 'NO' as VictimsInContactScheme.selected },
        dateVloInformed: null,
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(true)
    })

    it('returns true if hasVictimsInContactScheme is Not applicable and VLO date not set', () => {
      const { statuses } = taskCompleteness({
        ...emptyRecommendation,
        hasVictimsInContactScheme: { selected: 'NOT_APPLICABLE' as VictimsInContactScheme.selected },
        dateVloInformed: null,
      })
      expect(statuses.hasVictimsInContactScheme).toEqual(true)
    })
  })
})
