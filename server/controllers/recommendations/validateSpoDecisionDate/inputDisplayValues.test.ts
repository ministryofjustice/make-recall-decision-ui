import { inputDisplayValuesDecisionDateTime } from './inputDisplayValues'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesDecisionDateTime', () => {
  const apiValues = {
    decisionDateTime: '2022-01-01T12:00:00Z',
  } as RecommendationResponse

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      dateTime: {
        errorId: 'missingDateParts',
        href: '#dateTime-month',
        invalidParts: ['month'],
        name: 'dateTime',
        text: 'The date and time of the decision must include a month',
      },
    }
    const unsavedValues = {
      dateTime: {
        day: '12',
        hour: '12',
        minute: '53',
        month: '',
        year: '2022',
      },
    }
    const inputDisplayValues = inputDisplayValuesDecisionDateTime({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      dateTime: {
        invalidParts: ['month'],
        values: {
          day: '12',
          hour: '12',
          minute: '53',
          month: '',
          year: '2022',
        },
      },
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const inputDisplayValues = inputDisplayValuesDecisionDateTime({
      errors: undefined,
      unsavedValues: undefined,
      apiValues,
    })
    expect(inputDisplayValues).toEqual({
      dateTime: {
        values: {
          day: '01',
          hour: '12',
          minute: '00',
          month: '01',
          year: '2022',
        },
      },
    })
  })
})
