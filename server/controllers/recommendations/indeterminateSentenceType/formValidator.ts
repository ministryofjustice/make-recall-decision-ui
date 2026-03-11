import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import strings from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

const validateIndeterminateSentenceType = async ({
  requestBody,
  ftr56Enabled,
}: FormValidatorArgs & { ftr56Enabled?: boolean }): FormValidatorReturn => {
  let errors
  let valuesToSave

  const { indeterminateSentenceType } = requestBody

  const items = ftr56Enabled ? formOptions.indeterminateSentenceTypeFtr56 : formOptions.indeterminateSentenceType
  // api don't accept 'hint' so keep only value and text
  const itemsWithHint = items.map(({ value, text }) => ({ value, text }))

  const formId = ftr56Enabled ? 'indeterminateSentenceTypeFtr56' : 'indeterminateSentenceType'

  if (!indeterminateSentenceType || !isValueValid(indeterminateSentenceType as string, formId)) {
    const errorId = ftr56Enabled ? 'noIndeterminateSentenceTypeSelectedFtr56' : 'noIndeterminateSentenceTypeSelected'
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
        allOptions: itemsWithHint,
      },
    }
  }
  return {
    errors,
    valuesToSave,
  }
}

export default validateIndeterminateSentenceType
