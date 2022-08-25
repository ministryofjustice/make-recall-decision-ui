import { validateRecallType } from './formValidator'
import { formOptions } from '../helpers/formOptions'

describe('validateRecallType', () => {
  const recommendationId = '456'

  describe('valid', () => {
    it('returns valuesToSave and no errors if valid fixed term recall selected', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'FIXED_TERM',
            details: requestBody.recallTypeDetailsFixedTerm,
          },
          allOptions: formOptions.recallType,
        },
      })
    })

    it('returns valuesToSave and no errors if valid standard recall selected', async () => {
      const requestBody = {
        recallType: 'STANDARD',
        recallTypeDetailsStandard: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'STANDARD',
            details: requestBody.recallTypeDetailsStandard,
          },
          allOptions: formOptions.recallType,
        },
      })
    })

    it('returns valuesToSave and no errors if valid no recall selected', async () => {
      const requestBody = {
        recallType: 'NO_RECALL',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'NO_RECALL',
          },
          allOptions: formOptions.recallType,
        },
      })
    })

    it('redirects to custody status if Fixed term recall is selected', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { nextPagePath } = await validateRecallType({ requestBody, recommendationId })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
    })

    it('redirects to custody status if Standard recall is selected', async () => {
      const requestBody = {
        recallType: 'STANDARD',
        recallTypeDetailsStandard: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { nextPagePath } = await validateRecallType({ requestBody, recommendationId })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
    })

    it('redirects to no recall letter page if No recall is selected', async () => {
      const requestBody = {
        recallType: 'NO_RECALL',
        crn: 'X34534',
      }
      const { nextPagePath } = await validateRecallType({ requestBody, recommendationId })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/start-no-recall`)
    })
  })

  describe('invalid', () => {
    it('errors if fixed term recall is selected but standard detail sent', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsStandard: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        recallType: 'FIXED_TERM',
      })
      expect(errors).toEqual([
        {
          href: '#recallTypeDetailsFixedTerm',
          name: 'recallTypeDetailsFixedTerm',
          text: 'You must explain why you recommend this recall type',
          errorId: 'missingRecallTypeDetail',
        },
      ])
    })

    it('errors if fixed term recall is selected but no detail sent', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: '',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        recallType: 'FIXED_TERM',
      })
      expect(errors).toEqual([
        {
          href: '#recallTypeDetailsFixedTerm',
          name: 'recallTypeDetailsFixedTerm',
          text: 'You must explain why you recommend this recall type',
          errorId: 'missingRecallTypeDetail',
        },
      ])
    })

    it('errors if standard recall is selected but fixed term detail sent', async () => {
      const requestBody = {
        recallType: 'STANDARD',
        recallTypeDetailsFixedTerm: 'I recommend standard recall...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        recallType: 'STANDARD',
      })
      expect(errors).toEqual([
        {
          href: '#recallTypeDetailsStandard',
          name: 'recallTypeDetailsStandard',
          text: 'You must explain why you recommend this recall type',
          errorId: 'missingRecallTypeDetail',
        },
      ])
    })

    it('errors if standard recall is selected but no detail sent', async () => {
      const requestBody = {
        recallType: 'STANDARD',
        recallTypeDetailsStandard: '',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        recallType: 'STANDARD',
      })
      expect(errors).toEqual([
        {
          href: '#recallTypeDetailsStandard',
          name: 'recallTypeDetailsStandard',
          text: 'You must explain why you recommend this recall type',
          errorId: 'missingRecallTypeDetail',
        },
      ])
    })

    it('returns an error for the decision, if not set', async () => {
      const requestBody = {
        recallType: '',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#recallType',
          name: 'recallType',
          text: 'You must select a recommendation',
          errorId: 'noRecallTypeSelected',
        },
      ])
    })

    it('returns an error, if recallType is set to an invalid value', async () => {
      const requestBody = {
        recallType: 'BANANA',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#recallType',
          name: 'recallType',
          text: 'You must select a recommendation',
          errorId: 'noRecallTypeSelected',
        },
      ])
    })
  })
})
