import { RecommendationResponseGenerator } from '../../data/recommendations/recommendationGenerator'
import { generateBooleanCombinations } from '../testUtils/booleanUtils'
import {
  isFixedTermRecallMandatoryForRecommendation,
  isFixedTermRecallMandatoryForValueKeys,
  isFixedTermRecallMandatory,
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
        })
      )
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
        })
      )
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
        })
      )
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
              })
            )
          ).toBeFalsy()
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
      })
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
      })
    ).toBeTruthy()
  })
  it(' Returns false when all exclusion criteria fields are true', () => {
    expect(
      isFixedTermRecallMandatoryForRecommendation({
        isSentence48MonthsOrOver: true,
        isUnder18: true,
        isMappaCategory4: true,
        isMappaLevel2Or3: true,
        isRecalledOnNewChargedOffence: true,
        isServingFTSentenceForTerroristOffence: true,
        hasBeenChargedWithTerroristOrStateThreatOffence: true,
      })
    ).toBeFalsy()
  })
  describe(' Returns false when any exclusion criteria fields are true', () => {
    generateBooleanCombinations(7)
      .filter(c => !c.every(b => !b))
      .forEach(combination => {
        it(`${combination[0]} - ${combination[1]} - ${combination[2]} - ${combination[3]} - ${combination[4]} - ${combination[5]} - ${combination[6]}`, () => {
          expect(
            isFixedTermRecallMandatoryForRecommendation({
              isSentence48MonthsOrOver: combination[0],
              isUnder18: combination[1],
              isMappaCategory4: combination[2],
              isMappaLevel2Or3: combination[3],
              isRecalledOnNewChargedOffence: combination[4],
              isServingFTSentenceForTerroristOffence: combination[5],
              hasBeenChargedWithTerroristOrStateThreatOffence: combination[6],
            })
          ).toBeFalsy()
        })
      })
  })
})

describe('isFixedTermRecallMandatory', () => {
  it(' Returns false when no exclusion criteria fields are set', () => {
    expect(
      isFixedTermRecallMandatory(undefined, undefined, undefined, undefined, undefined, undefined, undefined)
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
              combination[6]
            )
          ).toBeFalsy()
        })
      })
  })
})
