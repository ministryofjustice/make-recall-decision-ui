import { inputDisplayValuesOffenceAnalysis } from './inputDisplayValues'

describe('inputDisplayValuesOffenceAnalysis', () => {
  const apiValues = {
    offenceAnalysis: 'Bad behaviour',
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      offenceAnalysis: {
        text: 'Enter the offence analysis',
        href: '#offenceAnalysis',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesOffenceAnalysis({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesOffenceAnalysis({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'Bad behaviour',
    })
  })
})
