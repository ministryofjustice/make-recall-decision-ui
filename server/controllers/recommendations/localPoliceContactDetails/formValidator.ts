import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isEmailValid, isPhoneValid } from '../../../utils/validate-formats'

export const validateLocalPoliceContactDetails = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { contactName, phoneNumber, faxNumber, emailAddress } = requestBody
  const emailValid = isEmailValid(emailAddress as string)
  const phoneValid = isPhoneValid(phoneNumber as string)
  const faxValid = isPhoneValid(faxNumber as string)
  if (!contactName || !emailAddress || !emailValid || !phoneNumber || !phoneValid || !faxNumber) {
    errors = []
    if (!contactName) {
      errors.push({ id: 'contactName', errorId: 'noLocalPoliceName' })
    }
    if (!phoneNumber) {
      errors.push({ id: 'phoneNumber', errorId: 'noLocalPolicePhone' })
    }
    if (phoneNumber && !phoneValid) {
      errors.push({ id: 'phoneNumber', errorId: 'invalidLocalPolicePhone' })
    }
    if (!faxNumber) {
      errors.push({ id: 'faxNumber', errorId: 'noLocalPoliceFax' })
    }
    if (faxNumber && !faxValid) {
      errors.push({ id: 'faxNumber', errorId: 'invalidLocalPoliceFax' })
    }
    if (!emailAddress) {
      errors.push({ id: 'emailAddress', errorId: 'noLocalPoliceEmail' })
    }
    if (emailAddress && !emailValid) {
      errors.push({ id: 'emailAddress', errorId: 'invalidLocalPoliceEmail' })
    }
    errors = errors.map(({ id, errorId }) =>
      makeErrorObject({
        id,
        text: strings.errors[errorId],
        errorId,
      })
    )
    return {
      errors,
      unsavedValues: {
        contactName,
        phoneNumber,
        faxNumber,
        emailAddress,
      },
    }
  }
  return {
    valuesToSave: {
      localPoliceContact: {
        contactName,
        phoneNumber,
        faxNumber,
        emailAddress,
      },
    },
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`,
  }
}
