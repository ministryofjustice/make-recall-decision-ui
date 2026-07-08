import { SentenceGroup } from '../sentenceInformation/formOptions'

export default (popName: string, sentenceGroup: SentenceGroup) => {
  if (sentenceGroup === SentenceGroup.ADULT_SDS) {
    return {
      isChargedWithOffence: {
        label: `Is ${popName} being recalled because of being charged with an offence?`,
      },
      isServingTerroristOrNationalSecurityOffence: {
        label: `Is ${popName} serving a sentence for a terrorist or national security offence?`,
      },
      isAtRiskOfInvolvedInForeignPowerThreat: {
        label: `Is ${popName} considered to be a person at risk of being involved in foreign power threat activity?`,
      },
      wasReferredToParoleBoard244ZB: {
        label: `Was ${popName} referred to the Parole Board under section 244ZB (power to detain) on this sentence?`,
      },
      wasRepatriatedForMurder: {
        label: `Has ${popName} been repatriated to the UK following a sentence for murder?`,
      },
      isServingSOPCSentence: {
        label: `Is ${popName} serving a Sentence for offenders of particular concern (SOPC)?`,
      },
      isServingDCRSentence: {
        label: `Is ${popName} serving a Discretionary conditional release (DCR) sentence?`,
      },
    }
  }
  // Youth flow questions
  return {
    isYouthSentenceOver12Months: {
      label: `Is ${popName}'s sentence 12 months or over?`,
    },
    isYouthChargedWithSeriousOffence: {
      label: `Is ${popName} being recalled because of being charged with a serious offence?`,
    },
  }
}
