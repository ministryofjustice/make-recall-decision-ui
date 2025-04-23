import { Request, Response } from 'express'
import { hasValue } from '../../../../utils/utils'
import { makeErrorObject } from '../../../../utils/errors'
import { strings } from '../../../../textStrings/en'

/**
 * Determines the appropriate error ID, or undefined if no error should be raised.
 *
 * If returning a defined error ID, it is constructed using the provided name of the field being checked,
 * with the expectation that there are error IDs defined for the missing and invalid cases, named
 * missing<fieldName> and invalid<fieldName> respectively.
 *
 * @param value The value to check
 * @param fieldName The name of the field being checked, used to construct the error ID
 * @param validValues An array of all valid values. Empty, null and undefined are interpreted as there
 *                    being no restrictions on the values the field accepts
 */
export function determineErrorId<ValueType>(value: ValueType, fieldName: string, validValues: ValueType[]): string {
  let errorId
  if (!hasValue(value)) {
    errorId = `missing${fieldName}`
  } else if (hasValue(validValues) && validValues.length > 0 && !validValues.includes(value)) {
    errorId = `invalid${fieldName}`
  }
  return errorId
}

/**
 * Builds an error object with the given error and field details and reloads the page with it added to the session
 */
export function reloadPageWithError(errorId: string, fieldId: string, req: Request, res: Response): void {
  const error = makeErrorObject({
    id: fieldId,
    text: strings.errors[errorId],
    errorId,
  })
  req.session.errors = [error]
  return res.redirect(303, req.originalUrl)
}
