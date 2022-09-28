import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'

export const validateIndeterminateSentenceType = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { indeterminateSentenceType } = requestBody
  if (!indeterminateSentenceType || !isValueValid(indeterminateSentenceType as string, 'indeterminateSentenceType')) {
    const errorId = 'noIndeterminateSentenceTypeSelected'
    errors = [
      makeErrorObject({
        id: 'indeterminateSentenceType',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      indeterminateSentenceType: {
        selected: indeterminateSentenceType,
        allOptions: formOptions.indeterminateSentenceType,
      },
    }
    // ignore any 'fromPage' parameter, user should proceed through entire flow back to task list
    nextPagePath = `${urlInfo.basePath}recall-type-indeterminate`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
