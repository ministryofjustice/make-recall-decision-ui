import { SentenceGroup } from '../sentenceInformation/formOptions'
import suitabilityFormOptions from './formOptions'

describe('suitability for fixed term recall form options', () => {
  ;[true, false].forEach(ftr56SentenceConvictionFeatureFlag => {
    describe(`with ftr56SentenceConvictionFeatureFlag ${ftr56SentenceConvictionFeatureFlag ? 'enabled' : 'disabled'}`, () => {
      it('should return the correct options for ADULT_SDS', () => {
        const result = suitabilityFormOptions('Test Test', SentenceGroup.ADULT_SDS, ftr56SentenceConvictionFeatureFlag)

        const expectedOptions = {
          isAtRiskOfInvolvedInForeignPowerThreat: {
            label: 'Is Test Test considered to be a person at risk of being involved in foreign power threat activity?',
          },
          isChargedWithOffence: { label: 'Is Test Test being recalled because of being charged with an offence?' },
          isServingDCRSentence: { label: 'Is Test Test serving a Discretionary conditional release (DCR) sentence?' },
          isServingSOPCSentence: {
            label: 'Is Test Test serving a Sentence for offenders of particular concern (SOPC)?',
          },
          isServingTerroristOrNationalSecurityOffence: {
            label: 'Is Test Test serving a sentence for a terrorist or national security offence?',
          },
          wasReferredToParoleBoard244ZB: {
            label: 'Was Test Test referred to the Parole Board under section 244ZB (power to detain) on this sentence?',
          },
          wasRepatriatedForMurder: {
            label: 'Has Test Test been repatriated to the UK following a sentence for murder?',
          },
        }
        if (ftr56SentenceConvictionFeatureFlag) {
          delete expectedOptions.isChargedWithOffence
        }

        expect(result).toEqual(expectedOptions)
      })

      it('should return the correct options for YOUTH_SDS', () => {
        const result = suitabilityFormOptions('Test Test', SentenceGroup.YOUTH_SDS, ftr56SentenceConvictionFeatureFlag)
        expect(result).toEqual({
          isYouthChargedWithSeriousOffence: {
            label: 'Is Test Test being recalled because of being charged with a serious offence?',
          },
          isYouthSentenceOver12Months: { label: "Is Test Test's sentence 12 months or over?" },
        })
      })
    })
  })
})
