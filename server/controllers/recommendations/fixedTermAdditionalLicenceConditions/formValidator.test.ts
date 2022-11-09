import { validateFixedTermLicenceConditions } from './formValidator'

describe('validateFixedTermLicenceConditions', () => {
  const recommendationId = '456'
  const urlInfo = {
    currentPageId: 'fixed-licence',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/fixed-licence`,
  }

  describe('valid', () => {
    it('returns valuesToSave and no errors if Yes is selected, with details', async () => {
      const requestBody = {
        hasFixedTermLicenceConditions: 'YES',
        hasFixedTermLicenceConditionsDetails: 'Details...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateFixedTermLicenceConditions({
        requestBody,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        fixedTermAdditionalLicenceConditions: {
          selected: true,
          details: requestBody.hasFixedTermLicenceConditionsDetails,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/sensitive-info`)
    })

    it('strips HTML tags from details', async () => {
      const requestBody = {
        hasFixedTermLicenceConditions: 'YES',
        hasFixedTermLicenceConditionsDetails: '<style></style>Details...',
        crn: 'X34534',
      }
      const { valuesToSave } = await validateFixedTermLicenceConditions({
        requestBody,
        urlInfo,
      })
      expect(valuesToSave).toHaveProperty('fixedTermAdditionalLicenceConditions.details', 'Details...')
    })

    it('returns valuesToSave and no errors if No selected, and resets details', async () => {
      const requestBody = {
        hasFixedTermLicenceConditions: 'NO',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateFixedTermLicenceConditions({
        requestBody,
        urlInfo,
      })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        fixedTermAdditionalLicenceConditions: {
          selected: false,
          details: null,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/sensitive-info`)
    })
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      hasFixedTermLicenceConditions: 'NO',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-circumstances' }
    const { nextPagePath } = await validateFixedTermLicenceConditions({
      requestBody,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-circumstances`)
  })

  describe('invalid', () => {
    it('errors if nothing is selected', async () => {
      const requestBody = {
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateFixedTermLicenceConditions({
        requestBody,
        urlInfo,
      })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({})
      expect(errors).toEqual([
        {
          href: '#hasFixedTermLicenceConditions',
          name: 'hasFixedTermLicenceConditions',
          text: 'Select whether there are additional licence conditions',
          errorId: 'noFixedTermLicenceConditionsSelected',
        },
      ])
    })

    it('errors if Yes is selected but no detail sent', async () => {
      const requestBody = {
        hasFixedTermLicenceConditions: 'YES',
        hasFixedTermLicenceConditionsDetails: ' ', // whitespace
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateFixedTermLicenceConditions({
        requestBody,
        urlInfo,
      })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        hasFixedTermLicenceConditions: 'YES',
      })
      expect(errors).toEqual([
        {
          href: '#hasFixedTermLicenceConditionsDetails',
          name: 'hasFixedTermLicenceConditionsDetails',
          text: 'Enter additional licence conditions',
          errorId: 'missingFixedTermLicenceConditionsDetail',
        },
      ])
    })

    it('returns an error, if hasFixedTermLicenceConditions is set to an invalid value', async () => {
      const requestBody = {
        hasFixedTermLicenceConditions: 'BANANA',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateFixedTermLicenceConditions({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#hasFixedTermLicenceConditions',
          name: 'hasFixedTermLicenceConditions',
          text: 'Select whether there are additional licence conditions',
          errorId: 'noFixedTermLicenceConditionsSelected',
        },
      ])
    })
  })
})
