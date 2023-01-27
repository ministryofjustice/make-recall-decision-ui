import { validatePreviousRecalls } from './formValidator'

describe('validatePreviousRecalls', () => {
  const recommendationId = '34'

  describe('when delete button is clicked', () => {
    it('returns an error if the index is not a number', async () => {
      const requestBody = {
        deletePreviousRecallDateIndex: 'not a number',
      }
      const { errors } = await validatePreviousRecalls({ requestBody, recommendationId })
      expect(errors).toEqual([
        {
          errorId: 'noDeletePreviousRecallIndex',
          name: 'noDeletePreviousRecallIndex',
          text: 'Select a previous recall to delete',
        },
      ])
    })

    it('returns an error if the index is not in the list of dates', async () => {
      const requestBody = {
        deletePreviousRecallDateIndex: '1',
        previousRecallDates: '2020-01-01',
      }
      const { errors } = await validatePreviousRecalls({ requestBody, recommendationId })
      expect(errors).toEqual([
        {
          errorId: 'noDeletePreviousRecallIndex',
          name: 'noDeletePreviousRecallIndex',
          text: 'Select a previous recall to delete',
        },
      ])
    })

    it('returns the correct values to save if the index is valid', async () => {
      const requestBody = {
        deletePreviousRecallDateIndex: '1',
        previousRecallDates: '2020-01-01|2020-01-02',
      }
      const { valuesToSave, nextPagePath, confirmationMessage } = await validatePreviousRecalls({
        requestBody,
        recommendationId,
      })
      expect(valuesToSave).toEqual({
        previousRecalls: {
          previousRecallDates: ['2020-01-01'],
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/previous-recalls`)
      expect(confirmationMessage).toEqual({
        text: 'The previous recall has been deleted',
        type: 'success',
      })
    })
  })

  describe('when continue button is clicked', () => {
    it('returns true for hasBeenRecalledPreviously if there are previous recall dates', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '1', // set to 1 if there are previous recall dates
      }
      const { errors, valuesToSave, nextPagePath } = await validatePreviousRecalls({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        previousRecalls: {
          hasBeenRecalledPreviously: true,
        },
      })
      expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
    })

    it('returns false for hasBeenRecalledPreviously if there are no previous recall dates', async () => {
      const requestBody = {
        crn: 'X34534',
        continueButton: '0', // set to 0 if there are previous recall dates
      }
      const { errors, valuesToSave, nextPagePath } = await validatePreviousRecalls({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        previousRecalls: {
          hasBeenRecalledPreviously: false,
        },
      })
      expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
    })
  })
})
