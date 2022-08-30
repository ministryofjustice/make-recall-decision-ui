import { isEmailValid, isPhoneValid } from './validate-formats'

describe('Validations', () => {
  describe('isEmailValid', () => {
    it('fails if domain suffix missing', () => {
      expect(isEmailValid('dave@probation')).toEqual(false)
    })

    it('fails if @ missing', () => {
      expect(isEmailValid('daveprobation.gov.uk')).toEqual(false)
    })

    it('passes if valid', () => {
      expect(isEmailValid('dave@probation.gov.uk')).toEqual(true)
    })
  })

  describe('isPhoneValid', () => {
    it('fails if it has a non-UK prefix', () => {
      expect(isPhoneValid('0011277231432')).toEqual(false)
    })

    it('passes if it has a UK prefix and no leading zero following that', () => {
      expect(isPhoneValid('00441277231432')).toEqual(true)
    })

    it('passes if it has a UK prefix and a leading zero following that', () => {
      expect(isPhoneValid('004401277231432')).toEqual(true)
    })

    it('passes if it has a UK prefix for a mobile number', () => {
      expect(isPhoneValid('004407934526353')).toEqual(true)
    })

    it('passes if it has a mobile number without UK prefix', () => {
      expect(isPhoneValid('07934526353')).toEqual(true)
    })

    it('passes if it has a mobile number without zero prefix', () => {
      expect(isPhoneValid('7934526353')).toEqual(true)
    })
  })
})
