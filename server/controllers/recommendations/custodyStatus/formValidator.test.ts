import validateCustodyStatus from './formValidator'

describe('validateCustodyStatus', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'custody-status',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/custody-status`,
  }

  describe(`with FTR56 enabled`, () => {
    it('returns valuesToSave and no errors if "Yes, prison" selected', async () => {
      const requestBody = {
        custodyStatus: 'YES_PRISON',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateCustodyStatus({
        requestBody,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        custodyStatus: {
          allOptions: [
            { value: 'YES_PRISON', text: 'Yes, prison custody' },
            { value: 'YES_POLICE', text: 'Yes, police custody' },
            { value: 'NO', text: 'No' },
          ],
          selected: 'YES_PRISON',
        },
      })
      expect(valuesToSave).not.toContain({
        hasArrestIssues: null,
        localPoliceContact: null,
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list`)
    })

    it('returns valuesToSave, null details, and no errors if "No" selected', async () => {
      const requestBody = {
        custodyStatus: 'NO',
        custodyStatusDetailsYesPolice: 'something from a previous entry',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateCustodyStatus({
        requestBody,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        custodyStatus: {
          allOptions: [
            { value: 'YES_PRISON', text: 'Yes, prison custody' },
            { value: 'YES_POLICE', text: 'Yes, police custody' },
            { value: 'NO', text: 'No' },
          ],
          selected: 'NO',
        },
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
        custodyStatus: 'VALUE',
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

  it('returns valuesToSave and no errors if set to "Yes, police custody" without details and FTR56 flag enabled', async () => {
    const requestBody = {
      custodyStatus: 'YES_POLICE',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateCustodyStatus({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      custodyStatus: {
        allOptions: [
          { value: 'YES_PRISON', text: 'Yes, prison custody' },
          { value: 'YES_POLICE', text: 'Yes, police custody' },
          { value: 'NO', text: 'No' },
        ],
        selected: 'YES_POLICE',
        details: null,
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list')
  })
})
