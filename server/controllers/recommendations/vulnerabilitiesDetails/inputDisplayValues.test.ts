import { formOptions } from '../formOptions/formOptions'
import { inputDisplayValuesVulnerabilitiesDetails } from './inputDisplayValues'

describe('inputDisplayValuesVulnerabilitiesDetails', () => {
  const apiValues = {
    vulnerabilities: {
      selected: [{ value: 'RISK_OF_SUICIDE_OR_SELF_HARM', details: 'foo' }],
      allOptions: formOptions.vulnerabilities,
    },
  }

  it("should use empty array for value if there's an error and no unsaved values", () => {
    const errors = {
      vulnerabilities: {
        errorId: 'missingVulnerabilitiesDetails',
        text: 'Enter more detail for mental health concerns',
        href: '#vulnerabilitiesDetails-MENTAL_HEALTH_CONCERNS',
      },
    }

    const inputDisplayValues = inputDisplayValuesVulnerabilitiesDetails({
      errors,
      unsavedValues: {
        vulnerabilities: [],
      },
      apiValues,
    })

    expect(inputDisplayValues).toEqual([])
  })

  it("should use unsaved values for value if there's an error", () => {
    const errors = {
      vulnerabilities: {
        errorId: 'missingVulnerabilitiesDetails',
        text: 'Enter more detail for mental health concerns',
        href: '#vulnerabilitiesDetails-MENTAL_HEALTH_CONCERNS',
      },
    }

    const inputDisplayValues = inputDisplayValuesVulnerabilitiesDetails({
      errors,
      unsavedValues: {
        vulnerabilities: [
          {
            value: 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
            details: 'foo',
          },
        ],
      },
      apiValues,
    })

    expect(inputDisplayValues).toEqual([
      {
        value: 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
        details: 'foo',
      },
    ])
  })

  it('should use apiValues for value if no error or unsaved values', () => {
    const inputDisplayValues = inputDisplayValuesVulnerabilitiesDetails({
      errors: undefined,
      unsavedValues: {},
      apiValues,
    })

    expect(inputDisplayValues).toEqual([
      {
        value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
        details: 'foo',
      },
    ])
  })
})
