import { validatePreviousReleases } from './formValidator'

describe('validatePreviousReleases', () => {
  const recommendationId = '34'

  describe('when delete button is clicked', () => {
    it('returns an error if the index is not a number', async () => {
      const requestBody = {
        deletePreviousReleaseDateIndex: 'not a number',
      }
      const { errors } = await validatePreviousReleases({ requestBody, recommendationId })
      expect(errors).toEqual([
        {
          errorId: 'noDeletePreviousReleaseIndex',
          name: 'noDeletePreviousReleaseIndex',
          text: 'Select a previous release to delete',
        },
      ])
    })

    it('returns an error if the index is not in the list of dates', async () => {
      const requestBody = {
        deletePreviousReleaseDateIndex: '1',
        previousReleaseDates: '2020-01-01',
      }
      const { errors } = await validatePreviousReleases({ requestBody, recommendationId })
      expect(errors).toEqual([
        {
          errorId: 'noDeletePreviousReleaseIndex',
          name: 'noDeletePreviousReleaseIndex',
          text: 'Select a previous release to delete',
        },
      ])
    })

    it('returns the correct values to save if the index is valid', async () => {
      const requestBody = {
        deletePreviousReleaseDateIndex: '1',
        previousReleaseDates: '2020-01-01|2020-01-02',
      }
      const { valuesToSave, nextPagePath, confirmationMessage } = await validatePreviousReleases({
        requestBody,
        recommendationId,
      })
      expect(valuesToSave).toEqual({
        previousReleases: {
          previousReleaseDates: ['2020-01-01'],
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/previous-releases`)
      expect(confirmationMessage).toEqual({
        text: 'The previous release has been deleted',
        type: 'success',
      })
    })
  })

  describe('when continue button is clicked', () => {
    it('returns true for hasBeenReleasedPreviously if there are previous release dates', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '1', // set to 1 if there are previous release dates
      }
      const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        previousReleases: {
          hasBeenReleasedPreviously: true,
        },
      })
      expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
    })

    it('returns false for hasBeenReleasedPreviously if there are no previous release dates', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '0', // set to 0 if there are previous release dates
      }
      const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        previousReleases: {
          hasBeenReleasedPreviously: false,
        },
      })
      expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
    })
  })
})
