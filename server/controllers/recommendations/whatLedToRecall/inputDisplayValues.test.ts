import { inputDisplayValuesWhatLedToRecall } from './inputDisplayValues'

describe('inputDisplayValuesWhatLedToRecall', () => {
  const apiValues = {
    whatLedToRecall: 'Bad behaviour',
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      whatLedToRecall: {
        text: 'Enter details of what has led to this recall',
        href: '#whatLedToRecall',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesWhatLedToRecall({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesWhatLedToRecall({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'Bad behaviour',
    })
  })
})
