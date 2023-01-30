import { inputDisplayValuesAddPreviousRecall } from './inputDisplayValues'

describe('inputDisplayValuesAddPreviousRecall', () => {
  it("should use empty strings for value if there's an error for value", () => {
    const errors = {
      previousRecallDate: {
        text: 'The previous recall date must have a real day and month',
        href: '#previousRecallDate',
        values: {
          day: '42',
          month: '23',
          year: '2022',
        },
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesAddPreviousRecall({ errors, unsavedValues, apiValues: {} })
    expect(inputDisplayValues).toEqual({
      value: {
        day: '42',
        month: '23',
        year: '2022',
      },
    })
  })

  it('should return undefined if no error', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesAddPreviousRecall({ errors, unsavedValues, apiValues: {} })
    expect(inputDisplayValues).toEqual({
      value: undefined,
    })
  })
})
