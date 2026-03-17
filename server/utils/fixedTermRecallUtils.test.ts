import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'
import generateBooleanCombinations from '../testUtils/booleanUtils'
import {
  isFixedTermRecallMandatoryForRecommendation,
  isFixedTermRecallMandatoryForValueKeys,
  isFixedTermRecallMandatory,
  isFixedTermRecallMandatoryForValueKeysFTR56,
} from './fixedTermRecallUtils'

describe('isFixedTermRecallMandatoryForRecommendation', () => {
  it(' Returns false when no exclusion criteria fields are set', () => {
    expect(
      isFixedTermRecallMandatoryForRecommendation(
        RecommendationResponseGenerator.generate({
          isSentence48MonthsOrOver: undefined,
          isUnder18: undefined,
          isMappaCategory4: undefined,
          isMappaLevel2Or3: undefined,
          isRecalledOnNewChargedOffence: undefined,
          isServingFTSentenceForTerroristOffence: undefined,
          hasBeenChargedWithTerroristOrStateThreatOffence: undefined,
        }),
        false,
      ),
    ).toBeFalsy()
  })
  it(' Returns true when all exclusion criteria fields are false', () => {
    expect(
      isFixedTermRecallMandatoryForRecommendation(
        RecommendationResponseGenerator.generate({
          isSentence48MonthsOrOver: false,
          isUnder18: false,
          isMappaCategory4: false,
          isMappaLevel2Or3: false,
          isRecalledOnNewChargedOffence: false,
          isServingFTSentenceForTerroristOffence: false,
          hasBeenChargedWithTerroristOrStateThreatOffence: false,
        }),
        false,
      ),
    ).toBeTruthy()
  })
  it(' Returns false when all exclusion criteria fields are true', () => {
    expect(
      isFixedTermRecallMandatoryForRecommendation(
        RecommendationResponseGenerator.generate({
          isSentence48MonthsOrOver: true,
          isUnder18: true,
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
          isRecalledOnNewChargedOffence: true,
          isServingFTSentenceForTerroristOffence: true,
          hasBeenChargedWithTerroristOrStateThreatOffence: true,
        }),
        false,
      ),
    ).toBeFalsy()
  })
  describe(' Returns false when any exclusion criteria fields are true', () => {
    generateBooleanCombinations(7)
      .filter(c => !c.every(b => !b))
      .forEach(combination => {
        it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]}`, () => {
          expect(
            isFixedTermRecallMandatoryForRecommendation(
              RecommendationResponseGenerator.generate({
                isSentence48MonthsOrOver: combination[0],
                isUnder18: combination[1],
                isMappaCategory4: combination[2],
                isMappaLevel2Or3: combination[3],
                isRecalledOnNewChargedOffence: combination[4],
                isServingFTSentenceForTerroristOffence: combination[5],
                hasBeenChargedWithTerroristOrStateThreatOffence: combination[6],
              }),
              false,
            ),
          ).toBeFalsy()
        })
      })
  })
})

describe('isFixedTermRecallMandatoryForRecommendation when FTR56 is enabled', () => {
  describe('when sentence Group is YOUTH_SDS', () => {
    it('returns false when no exclusion criteria fields are set', () => {
      expect(
        isFixedTermRecallMandatoryForRecommendation(
          RecommendationResponseGenerator.generate({
            sentenceGroup: SentenceGroup.YOUTH_SDS,
            isYouthSentenceOver12Months: undefined,
            isYouthChargedWithSeriousOffence: undefined,
          }),
          true,
        ),
      ).toBeFalsy()
    })

    it('returns true when all exclusion criteria fields are false', () => {
      expect(
        isFixedTermRecallMandatoryForRecommendation(
          RecommendationResponseGenerator.generate({
            sentenceGroup: SentenceGroup.YOUTH_SDS,
            isYouthSentenceOver12Months: false,
            isYouthChargedWithSeriousOffence: false,
          }),
          true,
        ),
      ).toBeTruthy()
    })

    it('returns false when all exclusion criteria fields are true', () => {
      expect(
        isFixedTermRecallMandatoryForRecommendation(
          RecommendationResponseGenerator.generate({
            sentenceGroup: SentenceGroup.YOUTH_SDS,
            isYouthSentenceOver12Months: true,
            isYouthChargedWithSeriousOffence: true,
          }),
          true,
        ),
      ).toBeFalsy()
    })

    describe(' Returns false when any exclusion criteria fields are true', () => {
      generateBooleanCombinations(2)
        .filter(c => !c.every(b => !b))
        .forEach(combination => {
          it(`${combination[0]} - ${combination[1]}`, () => {
            expect(
              isFixedTermRecallMandatoryForRecommendation(
                RecommendationResponseGenerator.generate({
                  sentenceGroup: SentenceGroup.YOUTH_SDS,
                  isYouthSentenceOver12Months: combination[0],
                  isYouthChargedWithSeriousOffence: combination[1],
                }),
                true,
              ),
            ).toBeFalsy()
          })
        })
    })
  })

  describe('when sentence Group is ADULT_SDS', () => {
    it('returns false when no exclusion criteria fields are set', () => {
      expect(
        isFixedTermRecallMandatoryForRecommendation(
          RecommendationResponseGenerator.generate({
            sentenceGroup: SentenceGroup.ADULT_SDS,
            isChargedWithOffence: undefined,
            isServingTerroristOrNationalSecurityOffence: undefined,
            isAtRiskOfInvolvedInForeignPowerThreat: undefined,
            wasReferredToParoleBoard244ZB: undefined,
            wasRepatriatedForMurder: undefined,
            isServingSOPCSentence: undefined,
            isServingDCRSentence: undefined,
          }),
          true,
        ),
      ).toBeFalsy()
    })

    it('returns true when all exclusion criteria fields are false', () => {
      expect(
        isFixedTermRecallMandatoryForRecommendation(
          RecommendationResponseGenerator.generate({
            sentenceGroup: SentenceGroup.ADULT_SDS,
            wasReferredToParoleBoard244ZB: false,
            wasRepatriatedForMurder: false,
            isServingSOPCSentence: false,
            isServingDCRSentence: false,
            isChargedWithOffence: false,
            isServingTerroristOrNationalSecurityOffence: false,
            isAtRiskOfInvolvedInForeignPowerThreat: false,
          }),
          true,
        ),
      ).toBeTruthy()
    })

    it('returns false when all exclusion criteria fields are true', () => {
      expect(
        isFixedTermRecallMandatoryForRecommendation(
          RecommendationResponseGenerator.generate({
            sentenceGroup: SentenceGroup.ADULT_SDS,
            isChargedWithOffence: true,
            isServingTerroristOrNationalSecurityOffence: true,
            isAtRiskOfInvolvedInForeignPowerThreat: true,
            wasReferredToParoleBoard244ZB: true,
            wasRepatriatedForMurder: true,
            isServingSOPCSentence: true,
            isServingDCRSentence: true,
          }),
          true,
        ),
      ).toBeFalsy()
    })

    describe(' Returns false when any exclusion criteria fields are true', () => {
      generateBooleanCombinations(7)
        .filter(c => !c.every(b => !b))
        .forEach(combination => {
          it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]}`, () => {
            expect(
              isFixedTermRecallMandatoryForRecommendation(
                RecommendationResponseGenerator.generate({
                  sentenceGroup: SentenceGroup.ADULT_SDS,
                  isChargedWithOffence: combination[0],
                  isServingTerroristOrNationalSecurityOffence: combination[1],
                  isAtRiskOfInvolvedInForeignPowerThreat: combination[2],
                  wasReferredToParoleBoard244ZB: combination[3],
                  wasRepatriatedForMurder: combination[4],
                  isServingSOPCSentence: combination[5],
                  isServingDCRSentence: combination[6],
                }),
                true,
              ),
            ).toBeFalsy()
          })
        })
    })
  })
})

describe('isFixedTermMandatoryForValueKeys', () => {
  it(' Returns false when no exclusion criteria fields are set', () => {
    expect(
      isFixedTermRecallMandatoryForValueKeys({
        isSentence48MonthsOrOver: undefined,
        isUnder18: undefined,
        isMappaCategory4: undefined,
        isMappaLevel2Or3: undefined,
        isRecalledOnNewChargedOffence: undefined,
        isServingFTSentenceForTerroristOffence: undefined,
        hasBeenChargedWithTerroristOrStateThreatOffence: undefined,
      }),
    ).toBeFalsy()
  })
  it(' Returns true when all exclusion criteria fields are false', () => {
    expect(
      isFixedTermRecallMandatoryForValueKeys({
        isSentence48MonthsOrOver: false,
        isUnder18: false,
        isMappaCategory4: false,
        isMappaLevel2Or3: false,
        isRecalledOnNewChargedOffence: false,
        isServingFTSentenceForTerroristOffence: false,
        hasBeenChargedWithTerroristOrStateThreatOffence: false,
      }),
    ).toBeTruthy()
  })
  it(' Returns false when all exclusion criteria fields are true', () => {
    expect(
      isFixedTermRecallMandatoryForRecommendation(
        {
          isSentence48MonthsOrOver: true,
          isUnder18: true,
          isMappaCategory4: true,
          isMappaLevel2Or3: true,
          isRecalledOnNewChargedOffence: true,
          isServingFTSentenceForTerroristOffence: true,
          hasBeenChargedWithTerroristOrStateThreatOffence: true,
        },
        false,
      ),
    ).toBeFalsy()
  })
  describe(' Returns false when any exclusion criteria fields are true', () => {
    generateBooleanCombinations(7)
      .filter(c => !c.every(b => !b))
      .forEach(combination => {
        it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]}`, () => {
          expect(
            isFixedTermRecallMandatoryForRecommendation(
              {
                isSentence48MonthsOrOver: combination[0],
                isUnder18: combination[1],
                isMappaCategory4: combination[2],
                isMappaLevel2Or3: combination[3],
                isRecalledOnNewChargedOffence: combination[4],
                isServingFTSentenceForTerroristOffence: combination[5],
                hasBeenChargedWithTerroristOrStateThreatOffence: combination[6],
              },
              false,
            ),
          ).toBeFalsy()
        })
      })
  })
})

describe('isFixedTermRecallMandatory', () => {
  it(' Returns false when no exclusion criteria fields are set', () => {
    expect(
      isFixedTermRecallMandatory(undefined, undefined, undefined, undefined, undefined, undefined, undefined),
    ).toBeFalsy()
  })
  it(' Returns true when all exclusion criteria fields are false', () => {
    expect(isFixedTermRecallMandatory(false, false, false, false, false, false, false)).toBeTruthy()
  })
  it(' Returns false when all exclusion criteria fields are true', () => {
    expect(isFixedTermRecallMandatory(true, true, true, true, true, true, true)).toBeFalsy()
  })
  describe(' Returns false when any exclusion criteria fields are true', () => {
    generateBooleanCombinations(7)
      .filter(c => !c.every(b => !b))
      .forEach(combination => {
        it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]}`, () => {
          expect(
            isFixedTermRecallMandatory(
              combination[0],
              combination[1],
              combination[2],
              combination[3],
              combination[4],
              combination[5],
              combination[6],
            ),
          ).toBeFalsy()
        })
      })
  })
})

describe('isFixedTermRecallMandatoryForValueKeysFTR56', () => {
  describe('when sentenceGroup is YOUTH_SDS', () => {
    it('returns false when no exclusion criteria fields are set', () => {
      expect(
        isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.YOUTH_SDS, {
          isYouthSentenceOver12Months: undefined,
          isYouthChargedWithSeriousOffence: undefined,
        }),
      ).toBeFalsy()
    })
    it('returns true when all exclusion criteria fields are false', () => {
      expect(
        isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.YOUTH_SDS, {
          isYouthSentenceOver12Months: false,
          isYouthChargedWithSeriousOffence: false,
        }),
      ).toBeTruthy()
    })
    it('returns false when all exclusion criteria fields are true', () => {
      expect(
        isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.YOUTH_SDS, {
          isYouthSentenceOver12Months: true,
          isYouthChargedWithSeriousOffence: true,
        }),
      ).toBeFalsy()
    })
    describe('returns false when any exclusion criteria fields are true', () => {
      generateBooleanCombinations(2)
        .filter(c => !c.every(b => !b))
        .forEach(combination => {
          it(`${combination[0]} - ${combination[1]}`, () => {
            expect(
              isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.YOUTH_SDS, {
                isYouthSentenceOver12Months: combination[0],
                isYouthChargedWithSeriousOffence: combination[1],
              }),
            ).toBeFalsy()
          })
        })
    })
  })

  describe('when sentenceGroup is ADULT_SDS', () => {
    it('returns false when no exclusion criteria fields are set', () => {
      expect(
        isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.ADULT_SDS, {
          isChargedWithOffence: undefined,
          isServingTerroristOrNationalSecurityOffence: undefined,
          isAtRiskOfInvolvedInForeignPowerThreat: undefined,
          wasReferredToParoleBoard244ZB: undefined,
          wasRepatriatedForMurder: undefined,
          isServingSOPCSentence: undefined,
          isServingDCRSentence: undefined,
        }),
      ).toBeFalsy()
    })
    it('returns true when all exclusion criteria fields are false', () => {
      expect(
        isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.ADULT_SDS, {
          isChargedWithOffence: false,
          isServingTerroristOrNationalSecurityOffence: false,
          isAtRiskOfInvolvedInForeignPowerThreat: false,
          wasReferredToParoleBoard244ZB: false,
          wasRepatriatedForMurder: false,
          isServingSOPCSentence: false,
          isServingDCRSentence: false,
        }),
      ).toBeTruthy()
    })
    it('returns false when all exclusion criteria fields are true', () => {
      expect(
        isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.ADULT_SDS, {
          isChargedWithOffence: true,
          isServingTerroristOrNationalSecurityOffence: true,
          isAtRiskOfInvolvedInForeignPowerThreat: true,
          wasReferredToParoleBoard244ZB: true,
          wasRepatriatedForMurder: true,
          isServingSOPCSentence: true,
          isServingDCRSentence: true,
        }),
      ).toBeFalsy()
    })
    describe('returns false when any exclusion criteria fields are true', () => {
      generateBooleanCombinations(7)
        .filter(c => !c.every(b => !b))
        .forEach(combination => {
          it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]}`, () => {
            expect(
              isFixedTermRecallMandatoryForValueKeysFTR56(SentenceGroup.ADULT_SDS, {
                isChargedWithOffence: combination[0],
                isServingTerroristOrNationalSecurityOffence: combination[1],
                isAtRiskOfInvolvedInForeignPowerThreat: combination[2],
                wasReferredToParoleBoard244ZB: combination[3],
                wasRepatriatedForMurder: combination[4],
                isServingSOPCSentence: combination[5],
                isServingDCRSentence: combination[6],
              }),
            ).toBeFalsy()
          })
        })
    })
  })
})
