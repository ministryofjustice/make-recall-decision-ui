import { validateArrestIssues } from './formValidator'

describe('validateArrestIssues', () => {
  const recommendationId = '456'

  describe('valid', () => {
    it('returns valuesToSave and no errors if Yes is selected, with details', () => {
      const requestBody = {
        hasArrestIssues: 'YES',
        hasArrestIssuesDetailsYes: 'Details...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = validateArrestIssues({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        hasArrestIssues: {
          selected: true,
          details: requestBody.hasArrestIssuesDetailsYes,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/confirmation-part-a`)
    })

    it('returns valuesToSave and no errors if No selected, and resets details', () => {
      const requestBody = {
        hasArrestIssues: 'NO',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = validateArrestIssues({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        hasArrestIssues: {
          selected: false,
          details: null,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/confirmation-part-a`)
    })
  })

  describe('invalid', () => {
    it('errors if nothing is selected', () => {
      const requestBody = {
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = validateArrestIssues({ requestBody, recommendationId })
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

    it('errors if Yes is selected but no detail sent', () => {
      const requestBody = {
        hasArrestIssues: 'YES',
        hasArrestIssuesDetailsYes: '',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = validateArrestIssues({ requestBody, recommendationId })
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

    it('returns an error, if hasArrestIssues is set to an invalid value', () => {
      const requestBody = {
        hasArrestIssues: 'BANANA',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = validateArrestIssues({ requestBody, recommendationId })
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
