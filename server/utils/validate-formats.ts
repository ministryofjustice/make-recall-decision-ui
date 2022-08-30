import { PhoneNumberUtil } from 'google-libphonenumber'

const validEmailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export const isEmailValid = (email: string) => validEmailRegex.test(email)

export const isPhoneValid = (phone: string) => {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance()
    return phoneUtil.isValidNumberForRegion(phoneUtil.parse(phone, 'GB'), 'GB')
  } catch (err) {
    return false
  }
}
