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
  const invalidEmail = emailAddress && !isEmailValid(emailAddress as string)
  const invalidPhone = phoneNumber && !isPhoneValid(phoneNumber as string)
  const invalidFax = faxNumber && !isPhoneValid(faxNumber as string)
  if (!contactName || invalidPhone || invalidFax || invalidEmail) {
    errors = []
    if (!contactName) {
      errors.push({ id: 'contactName', errorId: 'noLocalPoliceName' })
    }
    if (invalidPhone) {
      errors.push({ id: 'phoneNumber', errorId: 'invalidLocalPolicePhone' })
    }
    if (invalidFax) {
      errors.push({ id: 'faxNumber', errorId: 'invalidLocalPoliceFax' })
    }
    if (invalidEmail) {
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
