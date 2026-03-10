import { SentenceGroup } from '../sentenceInformation/formOptions'
import suitabilityFormOptions from './formOptions'

describe('suitability for fixed term recall form options', () => {
  describe('with FTR56 flag enabled', () => {
    it('should return the correct options for ADULT_SDS', () => {
      const result = suitabilityFormOptions(true, 'Test Test', SentenceGroup.ADULT_SDS)

      expect(result).toEqual({
        isAtRiskOfInvolvedInForeignPowerThreat: {
          label: 'Is Test Test considered to be a person at risk of being involved in foreign power threat activity?',
        },
        isChargedWithOffence: { label: 'Is Test Test being recalled because of being charged with an offence?' },
        isServingDCRSentence: { label: 'Is Test Test serving a Discretionary conditional release (DCR) sentence?' },
        isServingSOPCSentence: { label: 'Is Test Test serving a Sentence for offenders of particular concern (SOPC)?' },
        isServingTerroristOrNationalSecurityOffence: {
          label: 'Is Test Test serving a sentence for a terrorist or national security offence?',
        },
        wasReferredToParoleBoard244ZB: {
          label: 'Was Test Test referred to the Parole Board under section 244ZB (power to detain) on this sentence?',
        },
        wasRepatriatedForMurder: { label: 'Has Test Test been repatriated to the UK following a sentence for murder?' },
      })
    })

    it('should return the correct options for YOUTH_SDS', () => {
      const result = suitabilityFormOptions(true, 'Test Test', SentenceGroup.YOUTH_SDS)
      expect(result).toEqual({
        isYouthChargedWithSeriousOffence: {
          label: 'Is Test Test being recalled because of being charged with a serious offence?',
        },
        isYouthSentenceOver12Months: { label: 'Is Test Test sentence 12 months or over?' },
      })
    })
  })

  describe('with FTR56 flag disabled', () => {
    it('should return the correct options', () => {
      const result = suitabilityFormOptions(false, 'Test Test', undefined)
      expect(result).toEqual({
        hasBeenChargedWithTerroristOrStateThreatOffence: {
          label: 'Has Test Test been charged with a terrorist or state threat offence?',
        },
        isMappaCategory4: { label: 'Is Test Test in MAPPA category 4?' },
        isMappaLevel2Or3: { label: "Is Test Test's MAPPA level 2 or 3?" },
        isRecalledOnNewChargedOffence: { label: 'Is Test Test being recalled on a new charged offence?' },
        isSentence48MonthsOrOver: {
          hint: 'Use the total length if Test Test is serving consecutive sentences.',
          label: "Is Test Test's sentence 48 months or over?",
        },
        isServingFTSentenceForTerroristOffence: {
          label: 'Is Test Test serving a fixed term sentence for a terrorist offence?',
        },
        isUnder18: { label: 'Is Test Test under 18?' },
      })
    })
  })
})
