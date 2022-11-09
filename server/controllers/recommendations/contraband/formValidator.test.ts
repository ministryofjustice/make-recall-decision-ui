import { validateContraband } from './formValidator'

describe('validateContraband', () => {
  const recommendationId = '456'

  describe('valid', () => {
    it('returns valuesToSave and no errors if Yes is selected, with details', async () => {
      const requestBody = {
        hasContrabandRisk: 'YES',
        hasContrabandRiskDetailsYes: 'Details...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateContraband({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        hasContrabandRisk: {
          selected: true,
          details: requestBody.hasContrabandRiskDetailsYes,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-custody`)
    })

    it('strips HTML tags from details', async () => {
      const requestBody = {
        hasContrabandRisk: 'YES',
        hasContrabandRiskDetailsYes: '<b>Details...',
        crn: 'X34534',
      }
      const { valuesToSave } = await validateContraband({ requestBody, recommendationId })
      expect(valuesToSave).toHaveProperty('hasContrabandRisk.details', 'Details...')
    })

    it('returns valuesToSave and no errors if No selected, and resets details', async () => {
      const requestBody = {
        hasContrabandRisk: 'NO',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateContraband({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        hasContrabandRisk: {
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
      const { errors, valuesToSave, unsavedValues } = await validateContraband({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({})
      expect(errors).toEqual([
        {
          href: '#hasContrabandRisk',
          name: 'hasContrabandRisk',
          text: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
          errorId: 'noContrabandSelected',
        },
      ])
    })

    it('errors if Yes is selected but no detail sent', async () => {
      const requestBody = {
        hasContrabandRisk: 'YES',
        hasContrabandRiskDetailsYes: ' ', // whitespace
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateContraband({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        hasContrabandRisk: 'YES',
      })
      expect(errors).toEqual([
        {
          href: '#hasContrabandRiskDetailsYes',
          name: 'hasContrabandRiskDetailsYes',
          text: 'You must enter details of the contraband concerns',
          errorId: 'missingContrabandDetail',
        },
      ])
    })

    it('returns an error, if hasContrabandRisk is set to an invalid value', async () => {
      const requestBody = {
        hasContrabandRisk: 'BANANA',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateContraband({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#hasContrabandRisk',
          name: 'hasContrabandRisk',
          text: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
          errorId: 'noContrabandSelected',
        },
      ])
    })
  })
})
