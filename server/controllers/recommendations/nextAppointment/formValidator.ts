import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { dateHasError } from '../../../utils/dates'
import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc } from '../../../utils/dates/convert'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { isPhoneValid } from '../../../utils/validate-formats'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { nextPageLinkUrl } from '../helpers/urls'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateNextAppointment = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { howWillAppointmentHappen, probationPhoneNumber, createLetterTasksComplete } = requestBody
  const invalidAppointmentType = !isValueValid(howWillAppointmentHappen as string, 'howWillAppointmentHappen')

  const dateTimeOfAppointmentParts = {
    day: requestBody['dateTimeOfAppointment-day'],
    month: requestBody['dateTimeOfAppointment-month'],
    year: requestBody['dateTimeOfAppointment-year'],
    hour: requestBody['dateTimeOfAppointment-hour'],
    minute: requestBody['dateTimeOfAppointment-minute'],
  }
  const dateTimeOfAppointmentIso = convertGmtDatePartsToUtc(dateTimeOfAppointmentParts as Record<string, string>, {
    includeTime: true,
    dateMustBeInFuture: true,
    validatePartLengths: false,
  })

  const missingPhone = isEmptyStringOrWhitespace(probationPhoneNumber)
  const invalidPhone = !missingPhone && !isPhoneValid(probationPhoneNumber as string)

  // other errors
  if (
    !howWillAppointmentHappen ||
    invalidAppointmentType ||
    missingPhone ||
    invalidPhone ||
    dateHasError(dateTimeOfAppointmentIso)
  ) {
    errors = []
    if (!howWillAppointmentHappen || invalidAppointmentType) {
      errors.push(
        makeErrorObject({
          id: 'howWillAppointmentHappen',
          text: strings.errors.noAppointmentTypeSelected,
          errorId: 'noAppointmentTypeSelected',
        })
      )
    }
    if (dateHasError(dateTimeOfAppointmentIso)) {
      errors.push(
        makeErrorObject({
          name: 'dateTimeOfAppointment',
          id: invalidDateInputPart(dateTimeOfAppointmentIso as ValidationError, 'dateTimeOfAppointment'),
          text: formatValidationErrorMessage(
            dateTimeOfAppointmentIso as ValidationError,
            'date and time of the appointment'
          ),
          errorId: (dateTimeOfAppointmentIso as ValidationError).errorId,
          invalidParts: (dateTimeOfAppointmentIso as ValidationError).invalidParts,
          values: dateTimeOfAppointmentParts as Record<string, string>,
        })
      )
    }
    if (missingPhone) {
      errors.push(
        makeErrorObject({
          id: 'probationPhoneNumber',
          text: strings.errors.missingProbationPhoneNumber,
          errorId: 'missingProbationPhoneNumber',
        })
      )
    }

    if (invalidPhone) {
      errors.push(
        makeErrorObject({
          id: 'probationPhoneNumber',
          text: strings.errors.invalidPhoneNumber,
          errorId: 'invalidPhoneNumber',
        })
      )
    }
    const unsavedValues = {
      howWillAppointmentHappen,
      probationPhoneNumber,
      dateTimeOfAppointment: dateTimeOfAppointmentParts,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  if (!errors) {
    const valuesToSave = {
      nextAppointment: {
        howWillAppointmentHappen: {
          selected: howWillAppointmentHappen,
          allOptions: formOptions.howWillAppointmentHappen,
        },
        dateTimeOfAppointment: dateTimeOfAppointmentIso,
        probationPhoneNumber: stripHtmlTags(probationPhoneNumber as string),
      },
    }
    let nextPagePath = nextPageLinkUrl({ nextPageId: 'preview-no-recall', urlInfo })
    if (createLetterTasksComplete === '0') {
      nextPagePath = `${urlInfo.basePath}task-list-no-recall#heading-create-letter`
    }
    return {
      valuesToSave,
      nextPagePath,
    }
  }
}
