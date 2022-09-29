import { inputDisplayValuesVulnerabilities } from './inputDisplayValues'
import { formOptions } from '../formOptions/formOptions'
import { ValueWithDetails } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesVulnerabilities', () => {
  const apiValues = {
    vulnerabilities: {
      selected: ['ADULT_OR_CHILD_SAFEGUARDING_CONCERNS'] as ValueWithDetails[],
      allOptions: formOptions.vulnerabilities,
    },
  }

  it("should use empty array for value if there's an error", () => {
    const errors = {
      vulnerabilities: {
        text: 'You must indicate which alternatives to recall have been tried already',
        href: '#vulnerabilities',
      },
    }
    const inputDisplayValues = inputDisplayValuesVulnerabilities({
      errors,
      unsavedValues: {
        vulnerabilities: [],
      },
      apiValues,
    })
    expect(inputDisplayValues).toEqual([])
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesVulnerabilities({
      errors: undefined,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual(['ADULT_OR_CHILD_SAFEGUARDING_CONCERNS'])
  })
})
