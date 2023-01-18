import { inputDisplayValuesRosh } from './inputDisplayValues'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesRosh', () => {
  const apiValues = {
    currentRoshForPartA: {
      riskToChildren: 'LOW',
      riskToPublic: 'HIGH',
      riskToKnownAdult: 'MEDIUM',
      riskToStaff: 'VERY_HIGH',
      riskToPrisoners: 'NOT_APPLICABLE',
    },
  } as RecommendationResponse

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      riskToChildren: {
        text: 'You must select..',
        href: '#isThisAnEmergencyRecall',
      },
    }
    const unsavedValues = {
      riskToChildren: '',
      riskToPublic: '',
      riskToKnownAdult: '',
      riskToStaff: '',
      riskToPrisoners: '',
    }
    const inputDisplayValues = inputDisplayValuesRosh({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      riskToChildren: '',
      riskToPublic: '',
      riskToKnownAdult: '',
      riskToStaff: '',
      riskToPrisoners: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesRosh({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual(apiValues.currentRoshForPartA)
  })
})
