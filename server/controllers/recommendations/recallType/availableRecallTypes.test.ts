import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import { availableRecallTypes } from './availableRecallTypes'
import { formOptions } from '../formOptions/formOptions'
import { isEmptyStringOrWhitespace } from '../../../utils/utils'

describe('availableRecallTypes', () => {
  const numberOfSuitabilityFlags = 7
  // 1 << numberOfSuitabilityFlags shifts (bitwise) a 1 that number of bits, so we end up with
  // i going from 0000000 to 1111111, interpreting 0 as false and 1 as true further down when
  // we AND bitwise.
  // eslint-disable-next-line no-bitwise,no-plusplus
  for (let i = 0; i < 1 << numberOfSuitabilityFlags; i++) {
    const booleanArray: boolean[] = []

    // eslint-disable-next-line no-plusplus
    for (let j = numberOfSuitabilityFlags - 1; j >= 0; j--) {
      // eslint-disable-next-line no-bitwise
      booleanArray.push(Boolean(i & (1 << j)))
    }

    const ftr48SuitabilityFlags: Record<string, boolean> = {
      isUnder18: booleanArray[0],
      isSentence48MonthsOrOver: booleanArray[1],
      isMappaCategory4: booleanArray[2],
      isMappaLevel2Or3: booleanArray[3],
      isRecalledOnNewChargedOffence: booleanArray[4],
      isServingFTSentenceForTerroristOffence: booleanArray[5],
      hasBeenChargedWithTerroristOrStateThreatOffence: booleanArray[6],
    }

    const recommendation: RecommendationResponse = RecommendationResponseGenerator.generate({
      ...ftr48SuitabilityFlags,
    })

    const fieldsSetToTrue = Object.getOwnPropertyNames(ftr48SuitabilityFlags)
      .filter(fieldName => ftr48SuitabilityFlags[fieldName])
      .join(', ')

    describe('with FTR48 flag enabled', () => {
      let actualAvailableRecallTypes: { value: string; text: string }[]
      beforeEach(() => {
        actualAvailableRecallTypes = availableRecallTypes(true, recommendation)
      })
      if (isEmptyStringOrWhitespace(fieldsSetToTrue)) {
        it('only FTR and No Recall available when all fields are false', () => {
          const expectedAvailableRecallTypes = formOptions.recallType.filter(entry =>
            ['FIXED_TERM', 'NO_RECALL'].includes(entry.value)
          )
          expect(actualAvailableRecallTypes).toEqual(expectedAvailableRecallTypes)
        })
      } else {
        it(`all types are available when the following fields are true: ${fieldsSetToTrue}`, () => {
          expect(actualAvailableRecallTypes).toEqual(formOptions.recallType)
        })
      }
    })

    describe('with FTR48 flag disabled', () => {
      it(`all types are available when the following fields are true: ${fieldsSetToTrue ?? 'none'}`, () => {
        const actualAvailableRecallTypes = availableRecallTypes(false, recommendation)

        expect(actualAvailableRecallTypes).toEqual(formOptions.recallType)
      })
    })
  }
})
