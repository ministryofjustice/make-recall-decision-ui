import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateIndeterminateSentenceType = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave

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
  }
  return {
    errors,
    valuesToSave,
  }
}
