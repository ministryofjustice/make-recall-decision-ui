import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { isEmailValid, isPhoneValid } from '../../../utils/validate-formats'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { sharedPaths } from '../../../routes/paths/shared.paths'

export const validateLocalPoliceContactDetails = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { contactName, phoneNumber, faxNumber, emailAddress } = requestBody
  const missingName = isEmptyStringOrWhitespace(contactName)
  const invalidEmail = emailAddress && !isEmailValid(emailAddress as string)
  const invalidFax = faxNumber && !isPhoneValid(faxNumber as string)
  if (missingName || invalidFax || invalidEmail) {
    errors = []
    if (missingName) {
      errors.push({ id: 'contactName', errorId: 'noLocalPoliceName' })
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
        contactName: stripHtmlTags(contactName as string),
        phoneNumber: stripHtmlTags(phoneNumber as string),
        faxNumber: stripHtmlTags(faxNumber as string),
        emailAddress: stripHtmlTags(emailAddress as string),
      },
    },
    nextPagePath: `${sharedPaths.recommendations}/${recommendationId}/task-list#heading-custody`,
  }
}
