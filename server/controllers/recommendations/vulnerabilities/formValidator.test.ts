import { validateVulnerabilities, validateVulnerabilitiesRiskToSelf } from './formValidator'
import { formOptions } from '../formOptions/formOptions'
import { cleanseUiList } from '../../../utils/lists'
import { VULNERABILITY } from './formOptions'

describe('validateVulnerabilitiesRiskToSelf', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.MENTAL_HEALTH_CONCERNS, VULNERABILITY.BEING_BULLIED_BY_OTHERS],
    }
    const { errors, valuesToSave, nextPagePath } = await validateVulnerabilitiesRiskToSelf({
      requestBody,
      recommendationId,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilitiesRiskToSelf),
        selected: [{ value: VULNERABILITY.MENTAL_HEALTH_CONCERNS }, { value: VULNERABILITY.BEING_BULLIED_BY_OTHERS }],
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-vulnerability')
  })

  it('returns an error, if no checkbox is selected, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateVulnerabilitiesRiskToSelf({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
        name: 'vulnerabilities',
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
        errorId: 'noVulnerabilitiesSelected',
      },
    ])
  })

  it('allows None to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.NONE_OR_NOT_KNOWN, VULNERABILITY.NONE],
    }
    const { errors, valuesToSave } = await validateVulnerabilitiesRiskToSelf({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilitiesRiskToSelf),
        selected: [{ value: VULNERABILITY.NONE }],
      },
    })
  })

  it('allows NOT_KNOWN to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.NONE_OR_NOT_KNOWN, VULNERABILITY.NOT_KNOWN],
    }
    const { errors, valuesToSave } = await validateVulnerabilitiesRiskToSelf({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilitiesRiskToSelf),
        selected: [{ value: VULNERABILITY.NOT_KNOWN }],
      },
    })
  })

  it('should not allow None to be selected without NONE_OR_NOT_KNOWN selected', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.NONE],
    }
    const { errors } = await validateVulnerabilitiesRiskToSelf({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: 'noVulnerabilitiesSelected',
        href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
        name: 'vulnerabilities',
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
    ])
  })

  it('should not allow NOT_KNOWN to be selected without NONE_OR_NOT_KNOWN selected', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.NOT_KNOWN],
    }
    const { errors } = await validateVulnerabilitiesRiskToSelf({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: 'noVulnerabilitiesSelected',
        href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
        name: 'vulnerabilities',
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
    ])
  })

  it('should not allow NONE_OR_NOT_KNOWN to be selected without any radio buttons checked in', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.NONE_OR_NOT_KNOWN],
    }
    const { errors } = await validateVulnerabilitiesRiskToSelf({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: VULNERABILITY.NONE_OR_NOT_KNOWN,
        href: '#NONE_OR_NOT_KNOWN',
        name: VULNERABILITY.NONE_OR_NOT_KNOWN,
        text: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
      },
    ])
  })

  it('should not allow both normal and exclusive checkbox selected', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM, VULNERABILITY.NONE_OR_NOT_KNOWN],
    }
    const { errors } = await validateVulnerabilitiesRiskToSelf({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
        href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
        name: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
      {
        errorId: VULNERABILITY.NONE_OR_NOT_KNOWN,
        href: '#NONE_OR_NOT_KNOWN',
        name: VULNERABILITY.NONE_OR_NOT_KNOWN,
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
    ])
  })

  it('should not remove existing details when adding a new vulnerability', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.MENTAL_HEALTH_CONCERNS, VULNERABILITY.BEING_BULLIED_BY_OTHERS],
      'vulnerabilitiesDetails-MENTAL_HEALTH_CONCERNS': 'test',
    }

    const { errors, valuesToSave } = await validateVulnerabilitiesRiskToSelf({
      requestBody,
      recommendationId,
    })

    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilitiesRiskToSelf),
        selected: [
          { value: VULNERABILITY.MENTAL_HEALTH_CONCERNS, details: 'test' },
          { value: VULNERABILITY.BEING_BULLIED_BY_OTHERS, details: undefined },
        ],
      },
    })
  })
})

describe('validateVulnerabilities', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.MENTAL_HEALTH_CONCERNS, VULNERABILITY.BEING_BULLIED_BY_OTHERS],
      'vulnerabilitiesDetail-MENTAL_HEALTH_CONCERNS': '<br />Info..',
      'vulnerabilitiesDetail-BEING_BULLIED_BY_OTHERS': 'Details for..',
    }
    const { errors, valuesToSave, nextPagePath } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            details: 'Info..',
            value: VULNERABILITY.MENTAL_HEALTH_CONCERNS,
          },
          {
            details: 'Details for..',
            value: VULNERABILITY.BEING_BULLIED_BY_OTHERS,
          },
        ],
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-vulnerability')
  })

  it('returns an error, if no checkbox is selected, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#vulnerabilities',
        name: 'vulnerabilities',
        text: 'Select if there are vulnerabilities or additional needs',
        errorId: 'noVulnerabilitiesSelected',
      },
    ])
  })

  it('returns an error, if a selected checkbox is missing details, and no valuesToSave', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.MENTAL_HEALTH_CONCERNS, VULNERABILITY.CULTURAL_OR_LANGUAGE_DIFFERENCES],
      'vulnerabilitiesDetail-MENTAL_HEALTH_CONCERNS': 'Details',
      'vulnerabilitiesDetail-CULTURAL_OR_LANGUAGE_DIFFERENCES': ' ', // whitespace
    }
    const { errors, unsavedValues, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      vulnerabilities: [
        {
          details: 'Details',
          value: VULNERABILITY.MENTAL_HEALTH_CONCERNS,
        },
        {
          details: ' ',
          value: VULNERABILITY.CULTURAL_OR_LANGUAGE_DIFFERENCES,
        },
      ],
    })
    expect(errors).toEqual([
      {
        href: '#vulnerabilitiesDetail-CULTURAL_OR_LANGUAGE_DIFFERENCES',
        name: 'vulnerabilitiesDetail-CULTURAL_OR_LANGUAGE_DIFFERENCES',
        text: 'Enter more detail for cultural or language differences',
        errorId: 'missingVulnerabilitiesDetail',
      },
    ])
  })

  it('allows None to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.NONE],
    }
    const { errors, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            value: VULNERABILITY.NONE,
          },
        ],
      },
    })
  })

  it('allows NOT_KNOWN to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: [VULNERABILITY.NOT_KNOWN],
    }
    const { errors, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            value: VULNERABILITY.NOT_KNOWN,
          },
        ],
      },
    })
  })
})
