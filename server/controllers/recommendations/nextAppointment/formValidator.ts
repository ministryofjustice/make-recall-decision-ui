import { FormValidatorArgs, FormValidatorReturn, ObjectMap } from '../../../@types'
import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { dateHasError } from '../../../utils/dates'
import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc } from '../../../utils/dates/convert'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { isPhoneValid } from '../../../utils/validate-formats'
import { strings } from '../../../textStrings/en'

export const validateNextAppointment = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { howWillAppointmentHappen, probationPhoneNumber } = requestBody
  const invalidAppointmentType = !isValueValid(howWillAppointmentHappen as string, 'howWillAppointmentHappen')

  const dateTimeOfAppointmentParts = {
    day: requestBody['dateTimeOfAppointment-day'],
    month: requestBody['dateTimeOfAppointment-month'],
    year: requestBody['dateTimeOfAppointment-year'],
    hour: requestBody['dateTimeOfAppointment-hour'],
    minute: requestBody['dateTimeOfAppointment-minute'],
  }
  const dateTimeOfAppointmentIso = convertGmtDatePartsToUtc(dateTimeOfAppointmentParts as ObjectMap<string>, {
    includeTime: true,
    dateMustBeInFuture: true,
    validatePartLengths: false,
  })

  const invalidPhone = probationPhoneNumber && !isPhoneValid(probationPhoneNumber as string)

  // other errors
  if (
    !howWillAppointmentHappen ||
    invalidAppointmentType ||
    !probationPhoneNumber ||
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
          values: dateTimeOfAppointmentParts as ObjectMap<string>,
        })
      )
    }
    if (!probationPhoneNumber) {
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
    valuesToSave = {
      nextAppointment: {
        howWillAppointmentHappen: {
          selected: howWillAppointmentHappen,
          allOptions: formOptions.howWillAppointmentHappen,
        },
        dateTimeOfAppointment: dateTimeOfAppointmentIso,
        probationPhoneNumber,
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list-no-recall`
    return {
      valuesToSave,
      nextPagePath,
    }
  }
}
