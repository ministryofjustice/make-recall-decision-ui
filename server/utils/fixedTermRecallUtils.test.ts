import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'
import generateBooleanCombinations from '../testUtils/booleanUtils'
import {
  isFixedTermRecallMandatoryForRecommendation,
  isRecommendationDiscretionaryRecall,
  isStandardRecallMandatoryForRecommendation,
} from './fixedTermRecallUtils'
import { IsRecalledOnNewChargedOrConvictedOffence } from '../@types/make-recall-decision-api/models/IsRecalledOnNewChargedOrConvictedOffence'

describe('isFixedTermRecallMandatoryForRecommendation', () => {
  ;[true, false].forEach(ftr56SentenceConviction => {
    describe(`with FTR56 sentence conviction flag set to ${ftr56SentenceConviction}`, () => {
      describe('when sentence Group is YOUTH_SDS', () => {
        it('returns false when no exclusion criteria fields are set', () => {
          expect(
            isFixedTermRecallMandatoryForRecommendation(
              RecommendationResponseGenerator.generate({
                sentenceGroup: SentenceGroup.YOUTH_SDS,
                isYouthSentenceOver12Months: undefined,
                isYouthChargedWithSeriousOffence: undefined,
                isMappaLevel2Or3: undefined,
              }),
              ftr56SentenceConviction,
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
                isMappaLevel2Or3: false,
              }),
              ftr56SentenceConviction,
            ),
          ).toBeTruthy()
        })

        describe(' Returns false when any exclusion criteria fields are true', () => {
          generateBooleanCombinations(3)
            .filter(c => c.some(b => b))
            .forEach(combination => {
              it(`${combination[0]} - ${combination[1]} - ${combination[2]}`, () => {
                expect(
                  isFixedTermRecallMandatoryForRecommendation(
                    RecommendationResponseGenerator.generate({
                      sentenceGroup: SentenceGroup.YOUTH_SDS,
                      isYouthSentenceOver12Months: combination[0],
                      isYouthChargedWithSeriousOffence: combination[1],
                      isMappaLevel2Or3: combination[2],
                    }),
                    ftr56SentenceConviction,
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
                isRecalledOnNewChargedOrConvictedOffence: undefined,
                isChargedWithOffence: undefined,
                isServingTerroristOrNationalSecurityOffence: undefined,
                isAtRiskOfInvolvedInForeignPowerThreat: undefined,
                wasReferredToParoleBoard244ZB: undefined,
                wasRepatriatedForMurder: undefined,
                isServingSOPCSentence: undefined,
                isServingDCRSentence: undefined,
                isMappaCategory4: undefined,
                isMappaLevel2Or3: undefined,
              }),
              ftr56SentenceConviction,
            ),
          ).toBeFalsy()
        })

        if (!ftr56SentenceConviction) {
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
                  isMappaCategory4: false,
                  isMappaLevel2Or3: false,
                }),
                ftr56SentenceConviction,
              ),
            ).toBeTruthy()
          })
        } else {
          ;[
            IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
            IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
          ].forEach(isRecalledOnNewChargedOrConvictedOffence => {
            it(`returns true when all exclusion criteria fields are false and isRecalledOnNewChargedOrConvictedOffence is ${isRecalledOnNewChargedOrConvictedOffence}`, () => {
              expect(
                isFixedTermRecallMandatoryForRecommendation(
                  RecommendationResponseGenerator.generate({
                    sentenceGroup: SentenceGroup.ADULT_SDS,
                    wasReferredToParoleBoard244ZB: false,
                    wasRepatriatedForMurder: false,
                    isServingSOPCSentence: false,
                    isServingDCRSentence: false,
                    isRecalledOnNewChargedOrConvictedOffence: {
                      selected: isRecalledOnNewChargedOrConvictedOffence,
                    },
                    isServingTerroristOrNationalSecurityOffence: false,
                    isAtRiskOfInvolvedInForeignPowerThreat: false,
                    isMappaCategory4: false,
                    isMappaLevel2Or3: false,
                  }),
                  ftr56SentenceConviction,
                ),
              ).toBeTruthy()
            })
          })
        }

        if (!ftr56SentenceConviction) {
          describe(' Returns false when any exclusion criteria fields are true', () => {
            generateBooleanCombinations(9)
              .filter(c => c.some(b => b))
              .forEach(combination => {
                it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]} - ${combination[7]} - ${combination[8]}`, () => {
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
                        isMappaCategory4: combination[7],
                        isMappaLevel2Or3: combination[8],
                      }),
                      ftr56SentenceConviction,
                    ),
                  ).toBeFalsy()
                })
              })
          })
        } else {
          describe(` Returns false when isRecalledOnNewChargedOrConvictedOffence is Only Charged`, () => {
            generateBooleanCombinations(8).forEach(combination => {
              it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]} - ${combination[7]}`, () => {
                expect(
                  isFixedTermRecallMandatoryForRecommendation(
                    RecommendationResponseGenerator.generate({
                      sentenceGroup: SentenceGroup.ADULT_SDS,
                      isRecalledOnNewChargedOrConvictedOffence: {
                        selected: IsRecalledOnNewChargedOrConvictedOffence.selected.ONLY_CHARGED,
                      },
                      isServingTerroristOrNationalSecurityOffence: combination[0],
                      isAtRiskOfInvolvedInForeignPowerThreat: combination[1],
                      wasReferredToParoleBoard244ZB: combination[2],
                      wasRepatriatedForMurder: combination[3],
                      isServingSOPCSentence: combination[4],
                      isServingDCRSentence: combination[5],
                      isMappaCategory4: combination[6],
                      isMappaLevel2Or3: combination[7],
                    }),
                    ftr56SentenceConviction,
                  ),
                ).toBeFalsy()
              })
            })
          })
          ;[
            IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
            IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
          ].forEach(isRecalledOnNewChargedOrConvictedOffence => {
            describe(` Returns false when isRecalledOnNewChargedOrConvictedOffence is ${isRecalledOnNewChargedOrConvictedOffence} and any exclusion criteria fields are true`, () => {
              generateBooleanCombinations(8)
                .filter(c => c.some(b => b))
                .forEach(combination => {
                  it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]} - ${combination[7]}}`, () => {
                    expect(
                      isFixedTermRecallMandatoryForRecommendation(
                        RecommendationResponseGenerator.generate({
                          sentenceGroup: SentenceGroup.ADULT_SDS,
                          isRecalledOnNewChargedOrConvictedOffence: {
                            selected: isRecalledOnNewChargedOrConvictedOffence,
                          },
                          isServingTerroristOrNationalSecurityOffence: combination[0],
                          isAtRiskOfInvolvedInForeignPowerThreat: combination[1],
                          wasReferredToParoleBoard244ZB: combination[2],
                          wasRepatriatedForMurder: combination[3],
                          isServingSOPCSentence: combination[4],
                          isServingDCRSentence: combination[5],
                          isMappaCategory4: combination[6],
                          isMappaLevel2Or3: combination[7],
                        }),
                        ftr56SentenceConviction,
                      ),
                    ).toBeFalsy()
                  })
                })
            })
          })
        }
      })
    })
  })
})

describe('isRecommendationDiscretionaryRecall', () => {
  it('returns false when all exclusion criteria are false', () => {
    expect(
      isRecommendationDiscretionaryRecall({
        isMappaLevel2Or3: false,
        isYouthChargedWithSeriousOffence: false,
        isYouthSentenceOver12Months: false,
      }),
    ).toBeFalsy()
  })

  generateBooleanCombinations(3)
    .filter(c => c.some(b => b))
    .forEach(combination => {
      it(`${combination[0]} - ${combination[1]} - ${combination[2]}`, () => {
        expect(
          isRecommendationDiscretionaryRecall({
            isYouthChargedWithSeriousOffence: combination[0],
            isYouthSentenceOver12Months: combination[1],
            isMappaLevel2Or3: combination[2],
          }),
        ).toBeTruthy()
      })
    })
})

describe('isStandardRecallMandatoryForRecommendation', () => {
  ;[true, false].forEach(ftr56SentenceConviction => {
    describe(`with FTR56 sentence conviction flag set to ${ftr56SentenceConviction}`, () => {
      it(' Returns false when no exclusion criteria fields are set', () => {
        expect(
          isStandardRecallMandatoryForRecommendation(
            RecommendationResponseGenerator.generate({
              sentenceGroup: 'none',
              isMappaCategory4: undefined,
              isMappaLevel2Or3: undefined,
              wasReferredToParoleBoard244ZB: undefined,
              wasRepatriatedForMurder: undefined,
              isServingSOPCSentence: undefined,
              isServingDCRSentence: undefined,
              isChargedWithOffence: undefined,
              isRecalledOnNewChargedOrConvictedOffence: undefined,
              isServingTerroristOrNationalSecurityOffence: undefined,
              isAtRiskOfInvolvedInForeignPowerThreat: undefined,
              isYouthSentenceOver12Months: undefined,
              isYouthChargedWithSeriousOffence: undefined,
            }),
            ftr56SentenceConviction,
          ),
        ).toBeFalsy()
      })
      it(` Returns false when is Youth SDS`, () => {
        expect(
          isStandardRecallMandatoryForRecommendation(
            RecommendationResponseGenerator.generate({
              sentenceGroup: SentenceGroup.YOUTH_SDS,
            }),
            ftr56SentenceConviction,
          ),
        ).toBeFalsy()
      })
      it(` Returns true when is Indeterminate`, () => {
        expect(
          isStandardRecallMandatoryForRecommendation(
            RecommendationResponseGenerator.generate({
              sentenceGroup: SentenceGroup.INDETERMINATE,
            }),
            ftr56SentenceConviction,
          ),
        ).toBeTruthy()
      })
      it(` Returns true when is Extended`, () => {
        expect(
          isStandardRecallMandatoryForRecommendation(
            RecommendationResponseGenerator.generate({
              sentenceGroup: SentenceGroup.EXTENDED,
            }),
            ftr56SentenceConviction,
          ),
        ).toBeTruthy()
      })
      if (!ftr56SentenceConviction) {
        it(' Returns false when is Adult SDS and all adult exclusion criteria fields are false', () => {
          expect(
            isStandardRecallMandatoryForRecommendation(
              RecommendationResponseGenerator.generate({
                sentenceGroup: SentenceGroup.ADULT_SDS,
                isMappaCategory4: false,
                isMappaLevel2Or3: false,
                wasReferredToParoleBoard244ZB: false,
                wasRepatriatedForMurder: false,
                isServingSOPCSentence: false,
                isServingDCRSentence: false,
                isChargedWithOffence: false,
                isServingTerroristOrNationalSecurityOffence: false,
                isAtRiskOfInvolvedInForeignPowerThreat: false,
              }),
              ftr56SentenceConviction,
            ),
          ).toBeFalsy()
        })
      } else {
        ;[
          IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
          IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
        ].forEach(isRecalledOnNewChargedOrConvictedOffence => {
          it(` Returns false when is Adult SDS and all adult exclusion criteria fields are false and isRecalledOnNewChargedOrConvictedOffence is ${isRecalledOnNewChargedOrConvictedOffence}`, () => {
            expect(
              isStandardRecallMandatoryForRecommendation(
                RecommendationResponseGenerator.generate({
                  sentenceGroup: SentenceGroup.ADULT_SDS,
                  isMappaCategory4: false,
                  isMappaLevel2Or3: false,
                  wasReferredToParoleBoard244ZB: false,
                  wasRepatriatedForMurder: false,
                  isServingSOPCSentence: false,
                  isServingDCRSentence: false,
                  isRecalledOnNewChargedOrConvictedOffence: {
                    selected: isRecalledOnNewChargedOrConvictedOffence,
                  },
                  isServingTerroristOrNationalSecurityOffence: false,
                  isAtRiskOfInvolvedInForeignPowerThreat: false,
                }),
                ftr56SentenceConviction,
              ),
            ).toBeFalsy()
          })
        })
      }

      if (!ftr56SentenceConviction) {
        describe(' Returns true when is Adult SDS and any adult exclusion criteria fields are true', () => {
          generateBooleanCombinations(9)
            .filter(c => c.some(b => b))
            .forEach(combination => {
              it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]} - ${combination[7]} - ${combination[8]}`, () => {
                expect(
                  isStandardRecallMandatoryForRecommendation(
                    RecommendationResponseGenerator.generate({
                      sentenceGroup: SentenceGroup.ADULT_SDS,
                      isMappaCategory4: combination[0],
                      isMappaLevel2Or3: combination[1],
                      wasReferredToParoleBoard244ZB: combination[2],
                      wasRepatriatedForMurder: combination[3],
                      isServingSOPCSentence: combination[4],
                      isServingDCRSentence: combination[5],
                      isChargedWithOffence: combination[6],
                      isServingTerroristOrNationalSecurityOffence: combination[7],
                      isAtRiskOfInvolvedInForeignPowerThreat: combination[8],
                    }),
                    ftr56SentenceConviction,
                  ),
                ).toBeTruthy()
              })
            })
        })
      } else {
        ;[
          IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
          IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
        ].forEach(isRecalledOnNewChargedOrConvictedOffence => {
          describe(` Returns true when is Adult SDS and isRecalledOnNewChargedOrConvictedOffence is ${isRecalledOnNewChargedOrConvictedOffence} and any adult exclusion criteria fields are true`, () => {
            generateBooleanCombinations(8)
              .filter(c => c.some(b => b))
              .forEach(combination => {
                it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]} - ${combination[7]}}`, () => {
                  expect(
                    isStandardRecallMandatoryForRecommendation(
                      RecommendationResponseGenerator.generate({
                        sentenceGroup: SentenceGroup.ADULT_SDS,
                        isMappaCategory4: combination[0],
                        isMappaLevel2Or3: combination[1],
                        wasReferredToParoleBoard244ZB: combination[2],
                        wasRepatriatedForMurder: combination[3],
                        isServingSOPCSentence: combination[4],
                        isServingDCRSentence: combination[5],
                        isRecalledOnNewChargedOrConvictedOffence: {
                          selected: isRecalledOnNewChargedOrConvictedOffence,
                        },
                        isServingTerroristOrNationalSecurityOffence: combination[6],
                        isAtRiskOfInvolvedInForeignPowerThreat: combination[7],
                      }),
                      ftr56SentenceConviction,
                    ),
                  ).toBeTruthy()
                })
              })
          })
        })

        describe(` Returns true when is Adult SDS and isRecalledOnNewChargedOrConvictedOffence is Only Charged`, () => {
          generateBooleanCombinations(9).forEach(combination => {
            it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]} - ${combination[7]} - ${combination[8]}`, () => {
              expect(
                isStandardRecallMandatoryForRecommendation(
                  RecommendationResponseGenerator.generate({
                    sentenceGroup: SentenceGroup.ADULT_SDS,
                    isMappaCategory4: combination[0],
                    isMappaLevel2Or3: combination[1],
                    wasReferredToParoleBoard244ZB: combination[2],
                    wasRepatriatedForMurder: combination[3],
                    isServingSOPCSentence: combination[4],
                    isServingDCRSentence: combination[5],
                    isRecalledOnNewChargedOrConvictedOffence: {
                      selected: IsRecalledOnNewChargedOrConvictedOffence.selected.ONLY_CHARGED,
                    },
                    isServingTerroristOrNationalSecurityOffence: combination[6],
                    isAtRiskOfInvolvedInForeignPowerThreat: combination[7],
                  }),
                  ftr56SentenceConviction,
                ),
              ).toBeTruthy()
            })
          })
        })
      }
    })
  })
})
