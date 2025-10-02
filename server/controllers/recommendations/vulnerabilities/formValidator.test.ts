import { validateVulnerabilities } from './formValidator'
import { formOptions } from '../formOptions/formOptions'
import { cleanseUiList } from '../../../utils/lists'

describe('validateVulnerabilities', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['MENTAL_HEALTH_CONCERNS', 'BEING_BULLIED_BY_OTHERS'],
    }
    const { errors, valuesToSave, nextPagePath } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            value: 'MENTAL_HEALTH_CONCERNS',
          },
          {
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
      vulnerabilities: ['NONE_OR_NOT_KNOWN', 'NONE'],
    }
    const { errors, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            value: 'NONE_OR_NOT_KNOWN',
          },
          {
            value: 'NONE',
          },
        ],
      },
    })
  })

  it('allows NOT_KNOWN to be selected without details required', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['NONE_OR_NOT_KNOWN', 'NOT_KNOWN'],
    }
    const { errors, valuesToSave } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      vulnerabilities: {
        allOptions: cleanseUiList(formOptions.vulnerabilities),
        selected: [
          {
            value: 'NONE_OR_NOT_KNOWN',
          },
          {
            value: 'NOT_KNOWN',
          },
        ],
      },
    })
  })

  it('should not allow None to be selected without NONE_OR_NOT_KNOWN selected', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['NONE'],
    }
    const { errors } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: 'noVulnerabilitiesSelected',
        href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
        name: 'vulnerabilities',
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
      {
        errorId: 'NONE_OR_NOT_KNOWN',
        href: '#NONE_OR_NOT_KNOWN',
        name: 'NONE_OR_NOT_KNOWN',
        text: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
      },
    ])
  })

  it('should not allow NOT_KNOWN to be selected without NONE_OR_NOT_KNOWN selected', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['NOT_KNOWN'],
    }
    const { errors } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: 'noVulnerabilitiesSelected',
        href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
        name: 'vulnerabilities',
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
      {
        errorId: 'NONE_OR_NOT_KNOWN',
        href: '#NONE_OR_NOT_KNOWN',
        name: 'NONE_OR_NOT_KNOWN',
        text: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
      },
    ])
  })

  it('should not allow NONE_OR_NOT_KNOWN to be selected without any radio buttons checked in', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['NONE_OR_NOT_KNOWN'],
    }
    const { errors } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: 'NONE_OR_NOT_KNOWN',
        href: '#NONE_OR_NOT_KNOWN',
        name: 'NONE_OR_NOT_KNOWN',
        text: 'Select ‘No concerns about vulnerabilities or needs’, or ‘Do not know about vulnerabilities or needs’',
      },
    ])
  })

  it('should not allow both normal and exclusive checkbox selected', async () => {
    const requestBody = {
      crn: 'X514364',
      vulnerabilities: ['RISK_OF_SUICIDE_OR_SELF_HARM', 'NONE_OR_NOT_KNOWN'],
    }
    const { errors } = await validateVulnerabilities({ requestBody, recommendationId })
    expect(errors).toEqual([
      {
        errorId: 'RISK_OF_SUICIDE_OR_SELF_HARM',
        href: '#RISK_OF_SUICIDE_OR_SELF_HARM',
        name: 'RISK_OF_SUICIDE_OR_SELF_HARM',
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
      {
        errorId: 'NONE_OR_NOT_KNOWN',
        href: '#NONE_OR_NOT_KNOWN',
        name: 'NONE_OR_NOT_KNOWN',
        text: 'Select the vulnerabilities or needs {{ fullName }} may have, or ‘No concerns or do not know’',
      },
    ])
  })
})
