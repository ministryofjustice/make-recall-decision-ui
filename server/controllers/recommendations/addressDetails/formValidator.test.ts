import { validateAddress } from './formValidator'

describe('validateAddress', () => {
  const recommendationId = '456'

  describe('valid', () => {
    it('returns valuesToSave and no errors if No is selected, with details', async () => {
      const requestBody = {
        isMainAddressWherePersonCanBeFound: 'NO',
        isMainAddressWherePersonCanBeFoundDetailsNo: 'Details...',
        addressCount: '1',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateAddress({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        isMainAddressWherePersonCanBeFound: {
          selected: false,
          details: requestBody.isMainAddressWherePersonCanBeFoundDetailsNo,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-person-details`)
    })

    it('strips HTML tags from No details', async () => {
      const requestBody = {
        isMainAddressWherePersonCanBeFound: 'NO',
        isMainAddressWherePersonCanBeFoundDetailsNo: '<script>Details...</script>',
        addressCount: '1',
        crn: 'X34534',
      }
      const { valuesToSave } = await validateAddress({ requestBody, recommendationId })
      expect(valuesToSave).toHaveProperty('isMainAddressWherePersonCanBeFound.details', 'Details...')
    })

    it('returns valuesToSave and no errors if Yes selected, and resets details', async () => {
      const requestBody = {
        isMainAddressWherePersonCanBeFound: 'YES',
        addressCount: '1',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateAddress({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        isMainAddressWherePersonCanBeFound: {
          selected: true,
          details: null,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-person-details`)
    })

    it('returns valuesToSave and no errors if no addresses and details supplied', async () => {
      const requestBody = {
        isMainAddressWherePersonCanBeFound: '',
        isMainAddressWherePersonCanBeFoundDetailsNo: 'Details...',
        addressCount: '0',
        crn: 'X34534',
      }
      const { errors, valuesToSave, nextPagePath } = await validateAddress({ requestBody, recommendationId })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        isMainAddressWherePersonCanBeFound: {
          selected: false,
          details: requestBody.isMainAddressWherePersonCanBeFoundDetailsNo,
        },
      })
      expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-person-details`)
    })
  })

  describe('invalid', () => {
    it('errors if nothing is selected', async () => {
      const requestBody = {
        crn: 'X34534',
        addressCount: '1',
      }
      const { errors, valuesToSave, unsavedValues } = await validateAddress({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({})
      expect(errors).toEqual([
        {
          href: '#isMainAddressWherePersonCanBeFound',
          name: 'isMainAddressWherePersonCanBeFound',
          text: 'Select whether this is where the police can find {{ fullName }}',
          errorId: 'noAddressConfirmationSelected',
        },
      ])
    })

    it('errors if No is selected but no detail sent', async () => {
      const requestBody = {
        isMainAddressWherePersonCanBeFound: 'NO',
        isMainAddressWherePersonCanBeFoundDetailsNo: ' ', // whitespace
        addressCount: '1',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateAddress({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        isMainAddressWherePersonCanBeFound: 'NO',
      })
      expect(errors).toEqual([
        {
          href: '#isMainAddressWherePersonCanBeFoundDetailsNo',
          name: 'isMainAddressWherePersonCanBeFoundDetailsNo',
          text: 'You must enter the correct location',
          errorId: 'missingLocationDetail',
        },
      ])
    })

    it('errors if no addresses and no detail sent', async () => {
      const requestBody = {
        isMainAddressWherePersonCanBeFound: '',
        isMainAddressWherePersonCanBeFoundDetailsNo: '',
        addressCount: '0',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateAddress({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        isMainAddressWherePersonCanBeFound: '',
      })
      expect(errors).toEqual([
        {
          href: '#isMainAddressWherePersonCanBeFoundDetailsNo',
          name: 'isMainAddressWherePersonCanBeFoundDetailsNo',
          text: 'You must enter the correct location',
          errorId: 'missingLocationDetail',
        },
      ])
    })

    it('returns an error, if isMainAddressWherePersonCanBeFound is set to an invalid value', async () => {
      const requestBody = {
        isMainAddressWherePersonCanBeFound: 'BANANA',
        addressCount: '1',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateAddress({ requestBody, recommendationId })
      expect(valuesToSave).toBeUndefined()
      expect(errors).toEqual([
        {
          href: '#isMainAddressWherePersonCanBeFound',
          name: 'isMainAddressWherePersonCanBeFound',
          text: 'Select whether this is where the police can find {{ fullName }}',
          errorId: 'noAddressConfirmationSelected',
        },
      ])
    })
  })
})
