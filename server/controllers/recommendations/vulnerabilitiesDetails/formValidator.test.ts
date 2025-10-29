import { cleanseUiList } from '../../../utils/lists'
import { formOptions } from '../formOptions/formOptions'
import { VULNERABILITY } from '../vulnerabilities/formOptions'
import { validateVulnerabilitiesDetails, vulnerabilityRequiresDetails } from './formValidator'

describe('vulnerabilityRequiresDetails', () => {
  const vulnerabilitiesNotRequiringDetails = [
    VULNERABILITY.NONE_OR_NOT_KNOWN,
    VULNERABILITY.NONE,
    VULNERABILITY.NOT_KNOWN,
  ]
  const vulnerabilitiesRequiringDetails = Object.keys(VULNERABILITY).filter(
    (vulnerability: VULNERABILITY) => !vulnerabilitiesNotRequiringDetails.includes(vulnerability)
  ) as VULNERABILITY[]

  vulnerabilitiesRequiringDetails.forEach(vulnerabilityRequiringDetails => {
    it(`vulnerability ${vulnerabilityRequiringDetails} requires details`, async () => {
      const actualRequiresDetails = vulnerabilityRequiresDetails(vulnerabilityRequiringDetails)
      expect(actualRequiresDetails).toEqual(true)
    })
  })

  vulnerabilitiesNotRequiringDetails.forEach(vulnerabilityNotRequiringDetails => {
    it(`vulnerability ${vulnerabilityNotRequiringDetails} doesn't require details`, async () => {
      const actualRequiresDetails = vulnerabilityRequiresDetails(vulnerabilityNotRequiringDetails)
      expect(actualRequiresDetails).toEqual(false)
    })
  })
})

describe('validateVulnerabilitiesDetails', () => {
  it('return valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X123456',
      selectedVulnerabilities: [VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM],
      'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM': 'Foo',
    }

    const { errors, valuesToSave, unsavedValues } = await validateVulnerabilitiesDetails({ requestBody })

    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            details: 'Foo',
            value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
          },
        ],
      },
    })
    expect(unsavedValues).toBeUndefined()
  })

  it('return an error if any details are missing', async () => {
    const requestBody = {
      crn: 'X123456',
      selectedVulnerabilities: [
        VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
        VULNERABILITY.MENTAL_HEALTH_CONCERNS,
        VULNERABILITY.BEING_BULLIED_BY_OTHERS,
      ],
      'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM': 'foo',
      'vulnerabilitiesDetails-MENTAL_HEALTH_CONCERNS': '',
    }

    const { errors, valuesToSave, unsavedValues } = await validateVulnerabilitiesDetails({ requestBody })

    expect(errors).toEqual([
      {
        errorId: 'missingVulnerabilitiesDetails',
        name: 'vulnerabilitiesDetails-MENTAL_HEALTH_CONCERNS',
        text: 'Enter more detail for mental health concerns',
        href: '#vulnerabilitiesDetails-MENTAL_HEALTH_CONCERNS',
        values: undefined,
        invalidParts: undefined,
      },
      {
        errorId: 'missingVulnerabilitiesDetails',
        name: 'vulnerabilitiesDetails-BEING_BULLIED_BY_OTHERS',
        text: 'Enter more detail for being bullied by others',
        href: '#vulnerabilitiesDetails-BEING_BULLIED_BY_OTHERS',
        values: undefined,
        invalidParts: undefined,
      },
    ])

    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      vulnerabilities: [
        {
          value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
          details: 'foo',
        },
        {
          value: VULNERABILITY.MENTAL_HEALTH_CONCERNS,
          details: '',
        },
        {
          value: VULNERABILITY.BEING_BULLIED_BY_OTHERS,
          details: undefined,
        },
      ],
    })
  })

  it('return an error if any details are blank strings', async () => {
    const requestBody = {
      crn: 'X123456',
      selectedVulnerabilities: [VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM],
      'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM': ' ',
    }

    const { errors, valuesToSave, unsavedValues } = await validateVulnerabilitiesDetails({ requestBody })

    expect(errors).toEqual([
      {
        errorId: 'missingVulnerabilitiesDetails',
        href: '#vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
        invalidParts: undefined,
        name: 'vulnerabilitiesDetails-RISK_OF_SUICIDE_OR_SELF_HARM',
        text: 'Enter more detail for risk of suicide or self-harm',
        values: undefined,
      },
    ])
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      vulnerabilities: [
        {
          value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
          details: ' ',
        },
      ],
    })
  })
})
