import { SentenceGroup } from '../sentenceInformation/formOptions'

export default (ftr56Enabled: boolean, popName: string, sentenceGroup: SentenceGroup) => {
  if (ftr56Enabled === true) {
    if (sentenceGroup !== SentenceGroup.YOUTH_SDS) {
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
        label: `Is ${popName} sentence 12 months or over?`,
      },
      isYouthChargedWithSeriousOffence: {
        label: `Is ${popName} being recalled because of being charged with a serious offence?`,
      },
    }
  }

  return {
    isSentence48MonthsOrOver: {
      label: `Is ${popName}'s sentence 48 months or over?`,
      hint: `Use the total length if ${popName} is serving consecutive sentences.`,
    },
    isUnder18: {
      label: `Is ${popName} under 18?`,
    },
    isMappaCategory4: {
      label: `Is ${popName} in MAPPA category 4?`,
    },
    isMappaLevel2Or3: {
      label: `Is ${popName}'s MAPPA level 2 or 3?`,
    },
    isRecalledOnNewChargedOffence: {
      label: `Is ${popName} being recalled on a new charged offence?`,
    },
    isServingFTSentenceForTerroristOffence: {
      label: `Is ${popName} serving a fixed term sentence for a terrorist offence?`,
    },
    hasBeenChargedWithTerroristOrStateThreatOffence: {
      label: `Has ${popName} been charged with a terrorist or state threat offence?`,
    },
  }
}
