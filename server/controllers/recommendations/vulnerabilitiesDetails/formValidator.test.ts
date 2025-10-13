import { cleanseUiList } from '../../../utils/lists'
import { formOptions } from '../formOptions/formOptions'
import { validateVulnerabilitiesDetails } from './formValidator'

describe('validateVulnerabilitiesDetails', () => {
  it('return valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X123456',
      selectedVulnerabilities: ['RISK_OF_SUICIDE_OR_SELF_HARM'],
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
            value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
          },
        ],
      },
    })
    expect(unsavedValues).toBeUndefined()
  })

  it('return an error if any details are missing', async () => {
    const requestBody = {
      crn: 'X123456',
      selectedVulnerabilities: ['RISK_OF_SUICIDE_OR_SELF_HARM', 'MENTAL_HEALTH_CONCERNS', 'BEING_BULLIED_BY_OTHERS'],
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
          value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
          details: 'foo',
        },
        {
          value: 'MENTAL_HEALTH_CONCERNS',
          details: '',
        },
        {
          value: 'BEING_BULLIED_BY_OTHERS',
          details: undefined,
        },
      ],
    })
  })

  it('return an error if any details are blank strings', async () => {
    const requestBody = {
      crn: 'X123456',
      selectedVulnerabilities: ['RISK_OF_SUICIDE_OR_SELF_HARM'],
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
          value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
          details: ' ',
        },
      ],
    })
  })
})
