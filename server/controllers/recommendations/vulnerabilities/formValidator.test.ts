import { validateVulnerabilities } from './formValidator'
import { formOptions } from '../formOptions/formOptions'
import { cleanseUiList } from '../../../utils/lists'

describe('validateVulnerabilities', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['MENTAL_HEALTH_CONCERNS', 'BEING_BULLIED_BY_OTHERS'],
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
            value: 'MENTAL_HEALTH_CONCERNS',
          },
          {
            details: 'Details for..',
            value: 'BEING_BULLIED_BY_OTHERS',
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
      vulnerabilities: ['MENTAL_HEALTH_CONCERNS', 'CULTURAL_OR_LANGUAGE_DIFFERENCES'],
      'vulnerabilitiesDetail-MENTAL_HEALTH_CONCERNS': 'Details',
      'vulnerabilitiesDetail-CULTURAL_OR_LANGUAGE_DIFFERENCES': ' ', // whitespace
    }
    const { errors, unsavedValues, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      vulnerabilities: [
        {
          details: 'Details',
          value: 'MENTAL_HEALTH_CONCERNS',
        },
        {
          details: ' ',
          value: 'CULTURAL_OR_LANGUAGE_DIFFERENCES',
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
      vulnerabilities: ['NONE'],
    }
    const { errors, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            value: 'NONE',
          },
        ],
      },
    })
  })

  it('allows Unknown to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['UNKNOWN'],
    }
    const { errors, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            value: 'UNKNOWN',
          },
        ],
      },
    })
  })
})
