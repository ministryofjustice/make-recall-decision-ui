import suitabilityFormOptions from './formOptions'

describe('suitability for fixed term recall form options', () => {
  describe('with FTR56 flag enabled', () => {
    it('should return the correct options for ADULT_SDS', () => {
      const result = suitabilityFormOptions('Test Test')

      expect(result).toEqual({
        hasBeenChargedWithTerroristOrStateThreatOffence: {
          label: 'Has Test Test been charged with a terrorist or state threat offence?',
        },
        isMappaCategory4: { label: 'Is Test Test in MAPPA category 4?' },
        isMappaLevel2Or3: { label: `Is Test Test's MAPPA level 2 or 3?` },
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

  describe('with FTR56 flag disabled', () => {
    it('should return the correct options', () => {
      const result = suitabilityFormOptions('Test Test')
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
