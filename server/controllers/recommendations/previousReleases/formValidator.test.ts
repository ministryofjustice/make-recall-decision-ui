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
        releaseUnderECSL: 'YES',
        'dateOfRelease-day': '12',
        'dateOfRelease-month': '11',
        'dateOfRelease-year': '2012',
        'conditionalReleaseDate-day': '23',
        'conditionalReleaseDate-month': '06',
        'conditionalReleaseDate-year': '2121',
      }
      const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        releaseUnderECSL: true,
        previousReleases: {
          hasBeenReleasedPreviously: true,
        },
        dateOfRelease: '2012-11-12',
        conditionalReleaseDate: '2121-06-23',
      })
      expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
    })

    it('returns false for hasBeenReleasedPreviously if there are no previous release dates', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '0', // set to 0 if there are previous release dates
        releaseUnderECSL: 'YES',
        'dateOfRelease-day': '12',
        'dateOfRelease-month': '11',
        'dateOfRelease-year': '2012',
        'conditionalReleaseDate-day': '23',
        'conditionalReleaseDate-month': '06',
        'conditionalReleaseDate-year': '2121',
      }
      const { errors, valuesToSave, nextPagePath } = await validatePreviousReleases({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        releaseUnderECSL: true,
        previousReleases: {
          hasBeenReleasedPreviously: false,
        },
        dateOfRelease: '2012-11-12',
        conditionalReleaseDate: '2121-06-23',
      })
      expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
    })
    it('returns error if ECSL is not supplied', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '0',
      }
      const { errors, valuesToSave, nextPagePath, unsavedValues } = await validatePreviousReleases({
        requestBody,
        recommendationId,
      })

      expect(errors).toStrictEqual([
        {
          errorId: 'noReleaseUnderECSLSelected',
          name: 'releaseUnderECSL',
          href: '#releaseUnderECSL',
          text: 'Select whether {{ fullName }} has been released on an ECSL',
          invalidParts: undefined,
          values: undefined,
        },
      ])
      expect(valuesToSave).toBeUndefined()
      expect(nextPagePath).toBeUndefined()
      expect(unsavedValues).toStrictEqual({})
    })
    it('returns error if release date is not supplied and release under ECSL is true', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '0',
        releaseUnderECSL: 'YES',
      }
      const { errors, valuesToSave, nextPagePath, unsavedValues } = await validatePreviousReleases({
        requestBody,
        recommendationId,
      })

      expect(errors).toStrictEqual([
        {
          errorId: 'blankDateTime',
          name: 'dateOfRelease',
          href: '#dateOfRelease-day',
          text: 'Enter the date of release',
          invalidParts: undefined,
          values: { day: undefined, month: undefined, year: undefined },
        },
        {
          errorId: 'blankDateTime',
          name: 'conditionalReleaseDate',
          href: '#conditionalReleaseDate-day',
          text: 'Enter the conditional release date',
          invalidParts: undefined,
          values: { day: undefined, month: undefined, year: undefined },
        },
      ])
      expect(valuesToSave).toBeUndefined()
      expect(nextPagePath).toBeUndefined()
      expect(unsavedValues).toStrictEqual({
        conditionalReleaseDate: { day: undefined, month: undefined, year: undefined },
        dateOfRelease: { day: undefined, month: undefined, year: undefined },
        releaseUnderECSL: 'YES',
      })
    })
    it('returns no errors if  release under ECSL is false, and no dates are supplied', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '0',
        releaseUnderECSL: 'NO',
      }
      const { errors, valuesToSave, unsavedValues } = await validatePreviousReleases({ requestBody, recommendationId })

      expect(errors).toBeUndefined()
      expect(valuesToSave).toStrictEqual({
        conditionalReleaseDate: '',
        dateOfRelease: '',
        previousReleases: { hasBeenReleasedPreviously: false },
        releaseUnderECSL: false,
      })
      expect(unsavedValues).toBeUndefined()
    })
  })
})
