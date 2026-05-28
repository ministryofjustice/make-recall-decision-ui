export default (popName: string) => {
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
