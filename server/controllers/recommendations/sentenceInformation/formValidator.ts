import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { isValueValid } from '../formOptions/formOptions'
import { makeErrorObject } from '../../../utils/errors'
import { nextPageLinkUrl } from '../helpers/urls'
import { SentenceGroup } from './formOptions'
import ppPaths from '../../../routes/paths/pp'

const validateSentenceInformation = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { sentenceGroup } = requestBody

  const errors = []
  if (!sentenceGroup || !isValueValid(sentenceGroup as SentenceGroup, 'sentenceGroup')) {
    const errorId = 'missingSentenceGroup'
    errors.push(
      makeErrorObject({
        id: 'sentenceGroup',
        text: 'Select a sentence group',
        errorId,
      }),
    )
  }

  if (errors.length > 0) {
    return {
      errors,
      unsavedValues: { sentenceGroup },
    }
  }

  const valuesToSave = {
    sentenceGroup,
  }
  const nextPageId =
    sentenceGroup === SentenceGroup.INDETERMINATE ? ppPaths.indeterminateSentenceType : ppPaths.taskListConsiderRecall
  const nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })

  return {
    valuesToSave,
    nextPagePath,
  }
}

export default validateSentenceInformation
