import { inputDisplayValuesRecallReceived } from './inputDisplayValues'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesRecallReceived', () => {
  const apiValues = {
    receivedDateTime: '2022-05-13T12:35:53.000Z',
  } as RecommendationResponse

  it("should use empty strings and unsaved values for value if there's an error for value", () => {
    const errors = {
      dateTime: {
        errorId: 'missingDateParts',
        href: '#dateTime-month',
        invalidParts: ['month'],
        name: 'dateTime',
        text: 'The date and time must include a month',
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
    const inputDisplayValues = inputDisplayValuesRecallReceived({ errors, unsavedValues, apiValues })
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
    const inputDisplayValues = inputDisplayValuesRecallReceived({
      errors: undefined,
      unsavedValues: undefined,
      apiValues,
    })
    expect(inputDisplayValues).toEqual({
      dateTime: {
        values: {
          day: '13',
          hour: '13',
          minute: '35',
          month: '05',
          year: '2022',
        },
      },
    })
  })
})
