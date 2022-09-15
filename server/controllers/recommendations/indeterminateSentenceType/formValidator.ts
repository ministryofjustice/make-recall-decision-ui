import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

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
    nextPagePath = nextPageLinkUrl({ nextPageId: 'recall-type-indeterminate', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
