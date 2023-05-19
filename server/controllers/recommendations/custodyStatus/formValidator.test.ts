import { validateCustodyStatus } from './formValidator'

describe('validateCustodyStatus', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'custody-status',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/custody-status`,
  }

  it('returns valuesToSave and no errors if set to "Yes, police custody", and resets arrest issues / local police contact', async () => {
    const requestBody = {
      custodyStatus: 'YES_POLICE',
      custodyStatusDetailsYesPolice: 'West Ham Lane Police Station\n18 West Ham Lane\nStratford\nE15 4SG',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      custodyStatus: {
        allOptions: [
          { value: 'YES_PRISON', text: 'Yes, prison custody' },
          { value: 'YES_POLICE', text: 'Yes, police custody' },
          { value: 'NO', text: 'No' },
        ],
        selected: 'YES_POLICE',
        details: 'West Ham Lane Police Station\n18 West Ham Lane\nStratford\nE15 4SG',
      },
      hasArrestIssues: null,
      localPoliceContact: null,
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list')
  })

  it('strips HTML tags from "Yes, police custody" details', async () => {
    const requestBody = {
      custodyStatus: 'YES_POLICE',
      custodyStatusDetailsYesPolice:
        '<script>alert("hey")</script>West Ham Lane Police Station\n18 West Ham Lane\nStratford\nE15 4SG',
      crn: 'X34534',
    }
    const { valuesToSave } = await validateCustodyStatus({ requestBody, urlInfo })
    expect(valuesToSave).toHaveProperty(
      'custodyStatus.details',
      'alert("hey")West Ham Lane Police Station\n18 West Ham Lane\nStratford\nE15 4SG'
    )
  })

  it('returns valuesToSave and no errors if Yes, prison selected, and resets details / arrest issues / local police contact', async () => {
    const requestBody = {
      custodyStatus: 'YES_PRISON',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateCustodyStatus({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      custodyStatus: {
        allOptions: [
          { value: 'YES_PRISON', text: 'Yes, prison custody' },
          { value: 'YES_POLICE', text: 'Yes, police custody' },
          { value: 'NO', text: 'No' },
        ],
        selected: 'YES_PRISON',
        details: null,
      },
      hasArrestIssues: null,
      localPoliceContact: null,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list`)
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      custodyStatus: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateCustodyStatus({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#custodyStatus',
        name: 'custodyStatus',
        text: 'Select whether the person is in custody or not',
        errorId: 'noCustodyStatusSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      custodyStatus: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateCustodyStatus({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#custodyStatus',
        name: 'custodyStatus',
        text: 'Select whether the person is in custody or not',
        errorId: 'noCustodyStatusSelected',
      },
    ])
  })

  it('returns an error, if "Yes, police custody" is set, but no details', async () => {
    const requestBody = {
      custodyStatus: 'YES_POLICE',
      custodyStatusDetailsYesPolice: ' ', // whitespace
      crn: 'X34534',
    }
    const { errors, unsavedValues, valuesToSave } = await validateCustodyStatus({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      custodyStatus: 'YES_POLICE',
    })
    expect(errors).toEqual([
      {
        href: '#custodyStatusDetailsYesPolice',
        name: 'custodyStatusDetailsYesPolice',
        text: 'Enter the custody address',
        errorId: 'missingCustodyPoliceAddressDetail',
      },
    ])
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      custodyStatus: 'YES_PRISON',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-custody' }
    const { nextPagePath } = await validateCustodyStatus({
      requestBody,
      recommendationId,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-custody`)
  })
})
