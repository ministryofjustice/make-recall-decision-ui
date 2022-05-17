import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { isString } from '../../../utils/utils'

export const validatePersonSearch = (crn?: string) => {
  let errors
  let unsavedValues
  const invalidType = !isString(crn)
  let searchValue = invalidType ? crn : (crn as string).trim().toUpperCase()
  const emptyString = searchValue === ''
  if (invalidType || emptyString) {
    errors = []
    const errorMessage = invalidType ? strings.errors.invalidCrnFormat : strings.errors.missingCrn
    errors = [
      makeErrorObject({
        id: 'crn',
        text: errorMessage,
      }),
    ]
    unsavedValues = { crn }
    searchValue = undefined
  }

  return { errors, searchValue, unsavedValues }
}
