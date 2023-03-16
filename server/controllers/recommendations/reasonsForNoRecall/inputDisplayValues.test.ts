import { inputDisplayValuesReasonsForNoRecall } from './inputDisplayValues'

describe('inputDisplayValuesReasonsForNoRecall', () => {
  const apiValues = {
    reasonsForNoRecall: {
      licenceBreach: 'details',
      noRecallRationale: 'details',
      popProgressMade: 'details',
      popThoughts: 'details',
      futureExpectations: 'details',
    },
  }

  it("should use empty values if there's an error, and no unsaved values", () => {
    const errors = {
      futureExpectations: {
        errorId: 'noRecallFutureExpectations',
        href: '#futureExpectations',
        name: 'futureExpectations',
        text: 'You must explain the actions you have agreed for the future',
      },
    }
    const inputDisplayValues = inputDisplayValuesReasonsForNoRecall({
      errors,
      unsavedValues: {},
      apiValues,
    })
    expect(inputDisplayValues).toEqual({})
  })

  it("should use any unsaved values if there's an error", () => {
    const errors = {
      futureExpectations: {
        errorId: 'noRecallFutureExpectations',
        href: '#futureExpectations',
        name: 'futureExpectations',
        text: 'You must explain the actions you have agreed for the future',
      },
    }
    const unsavedValues = {
      licenceBreach: 'unsaved',
      popProgressMade: 'unsaved',
      futureExpectations: 'unsaved',
    }
    const inputDisplayValues = inputDisplayValuesReasonsForNoRecall({
      errors,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual(unsavedValues)
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesReasonsForNoRecall({
      errors: undefined,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual(apiValues.reasonsForNoRecall)
  })
})
