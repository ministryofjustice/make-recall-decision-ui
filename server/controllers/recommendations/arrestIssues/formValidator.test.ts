import { validateArrestIssues } from './formValidator'

describe('validateArrestIssues', () => {
  const recommendationId = '456'

  describe('valid', () => {
    it('returns valuesToSave and no errors if Yes is selected, with details', async () => {
      const requestBody = {
        hasArrestIssues: 'YES',
        hasArrestIssuesDetailsYes: 'Details...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateArrestIssues({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        hasArrestIssues: {
          selected: true,
          details: requestBody.hasArrestIssuesDetailsYes,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-custody`)
    })

    it('strips HTML tags from details', async () => {
      const requestBody = {
        hasArrestIssues: 'YES',
        hasArrestIssuesDetailsYes: '<p>Details...</p>',
        crn: 'X34534',
      }
      const { valuesToSave } = await validateArrestIssues({ requestBody, recommendationId })
      expect(valuesToSave).toHaveProperty('hasArrestIssues.details', 'Details...')
    })

    it('returns valuesToSave and no errors if No selected, and resets details', async () => {
      const requestBody = {
        hasArrestIssues: 'NO',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateArrestIssues({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        hasArrestIssues: {
          selected: false,
          details: null,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-custody`)
    })
  })

  describe('invalid', () => {
    it('errors if nothing is selected', async () => {
      const requestBody = {
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateArrestIssues({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({})
      expect(errors).toEqual([
        {
          href: '#hasArrestIssues',
          name: 'hasArrestIssues',
          text: "Select whether there's anything the police should know",
          errorId: 'noArrestIssuesSelected',
        },
      ])
    })

    it('errors if Yes is selected but no detail sent', async () => {
      const requestBody = {
        hasArrestIssues: 'YES',
        hasArrestIssuesDetailsYes: ' ', // whitespace
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateArrestIssues({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        hasArrestIssues: 'YES',
      })
      expect(errors).toEqual([
        {
          href: '#hasArrestIssuesDetailsYes',
          name: 'hasArrestIssuesDetailsYes',
          text: 'You must enter details of the arrest issues',
          errorId: 'missingArrestIssuesDetail',
        },
      ])
    })

    it('returns an error, if hasArrestIssues is set to an invalid value', async () => {
      const requestBody = {
        hasArrestIssues: 'BANANA',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateArrestIssues({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#hasArrestIssues',
          name: 'hasArrestIssues',
          text: "Select whether there's anything the police should know",
          errorId: 'noArrestIssuesSelected',
        },
      ])
    })
  })
})
