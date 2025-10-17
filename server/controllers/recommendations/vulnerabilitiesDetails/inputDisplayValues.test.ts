import { formOptions } from '../formOptions/formOptions'
import { inputDisplayValuesVulnerabilitiesDetails } from './inputDisplayValues'
import { VULNERABILITY } from '../vulnerabilities/formOptions'

describe('inputDisplayValuesVulnerabilitiesDetails', () => {
  const apiValues = {
    vulnerabilities: {
      selected: [{ value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM, details: 'foo' }],
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
            value: VULNERABILITY.ADULT_OR_CHILD_SAFEGUARDING_CONCERNS,
            details: 'foo',
          },
        ],
      },
      apiValues,
    })

    expect(inputDisplayValues).toEqual([
      {
        value: VULNERABILITY.ADULT_OR_CHILD_SAFEGUARDING_CONCERNS,
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
        value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
        details: 'foo',
      },
    ])
  })
})
