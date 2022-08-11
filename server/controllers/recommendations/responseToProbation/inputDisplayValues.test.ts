import { inputDisplayValuesResponseToProbation } from './inputDisplayValues'

describe('inputDisplayValuesResponseToProbation', () => {
  const apiValues = {
    responseToProbation: 'Good',
  }

  it("should use empty string for value if there's an error for value", () => {
    const errors = {
      responseToProbation: {
        text: 'You must explain how Paula Smith has responded to probation',
        href: '#responseToProbation',
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesResponseToProbation({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: '',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesResponseToProbation({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: 'Good',
    })
  })
})
