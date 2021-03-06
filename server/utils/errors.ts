import { FormError, KeyedFormErrors, NamedFormError, ObjectMap } from '../@types'
import { ValidationError } from '../@types/dates'
import { MIN_VALUE_YEAR } from './dates/convert'
import { listToString } from './utils'
import { strings } from '../textStrings/en'
import { SanitisedError } from '../sanitisedError'

export const makeErrorObject = ({
  id,
  name,
  text,
  values,
  errorId,
}: {
  id: string
  name?: string
  text: string
  values?: ObjectMap<string> | string
  errorId?: string
}): NamedFormError => ({
  name: name || id,
  text,
  href: `#${id}`,
  values,
  errorId,
})

export const transformErrorMessages = (errors: NamedFormError[]): KeyedFormErrors => {
  const errorMap = errors.filter(Boolean).reduce((acc: ObjectMap<FormError>, curr: NamedFormError) => {
    const { name, ...rest } = curr
    acc[name] = rest
    return acc
  }, {})
  return {
    list: errors,
    ...errorMap,
  } as KeyedFormErrors
}

export const formatValidationErrorMessage = (validationError: ValidationError, fieldLabel?: string): string => {
  switch (validationError.errorId) {
    case 'blankDateTime':
      return `Enter the ${fieldLabel}`
    case 'dateMustBeInPast':
      return `The ${fieldLabel} must be today or in the past`
    case 'dateMustBeInFuture':
      return `The ${fieldLabel} must be in the future`
    case 'invalidDate':
      return `The ${fieldLabel} must be a real date`
    case 'invalidTime':
      return `The ${fieldLabel} must be a real time`
    case 'missingDate':
      return `The ${fieldLabel} must include a date`
    case 'missingTime':
      return `The ${fieldLabel} must include a time`
    case 'missingDateParts':
      return `The ${fieldLabel} must include a ${listToString(validationError.invalidParts, 'and')}`
    case 'outOfRangeValueDateParts':
      return `The ${fieldLabel} must have a real ${listToString(validationError.invalidParts, 'and')}`
    case 'minLengthDateTimeParts':
      return `The ${fieldLabel} must be in the correct format, like 06 05 2021 09:03`
    case 'minValueDateYear':
      return `The ${fieldLabel} must include a year after ${MIN_VALUE_YEAR}`
    case 'minLengthDateParts':
      return `The ${fieldLabel} must be in the correct format, like 06 05 2021`
    case 'fromDateAfterToDate':
      return 'The from date must be on or before the to date'
    case 'minLengthSearchContactsTerm':
      return 'Search term must be 2 characters or more'
    default:
      return `Error - ${fieldLabel}`
  }
}

export const invalidDateInputPart = (validationError: ValidationError, fieldLabel?: string): string => {
  const part = validationError.invalidParts?.length ? validationError.invalidParts[0] : 'day'
  return `${fieldLabel}-${part}`
}

export const saveErrorObject = {
  name: 'saveError',
  text: strings.errors.saveChanges,
}

export const saveErrorWithDetails = ({ err, isProduction }: { err: SanitisedError; isProduction: boolean }) => {
  if (isProduction) {
    return saveErrorObject
  }
  return {
    name: 'saveError',
    text: err.text || err.stack,
  }
}
