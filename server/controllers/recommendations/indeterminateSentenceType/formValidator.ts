import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import strings from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

const validateIndeterminateSentenceType = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave

  const { indeterminateSentenceType } = requestBody

  const items = formOptions.indeterminateSentenceTypeFtr56
  // api don't accept 'hint' so keep only value and text
  const itemsWithoutHint = items.map(({ value, text }) => ({ value, text }))

  const formId = 'indeterminateSentenceTypeFtr56'

  if (!indeterminateSentenceType || !isValueValid(indeterminateSentenceType as string, formId)) {
    const errorId = 'noIndeterminateSentenceTypeSelectedFtr56'
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
        allOptions: itemsWithoutHint,
      },
    }
  }
  return {
    errors,
    valuesToSave,
  }
}

export default validateIndeterminateSentenceType
