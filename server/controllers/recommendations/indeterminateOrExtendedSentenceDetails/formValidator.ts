import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'
import { nextPageLinkUrl } from '../helpers/urls'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormOption, FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

const missingDetailsError = (optionId: string) => {
  switch (optionId) {
    case 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE':
      return strings.errors.missingIndeterminateDetailIndexOffence
    case 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE':
      return strings.errors.missingIndeterminateDetailSexualViolent
    case 'OUT_OF_TOUCH':
      return strings.errors.missingIndeterminateDetailContact
    default:
      return 'Enter details'
  }
}

export const validateIndeterminateDetails = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  const { indeterminateOrExtendedSentenceDetails } = requestBody
  const selected = Array.isArray(indeterminateOrExtendedSentenceDetails)
    ? indeterminateOrExtendedSentenceDetails
    : [indeterminateOrExtendedSentenceDetails]
  const invalidAlternative = selected.some(
    selectionId => !isValueValid(selectionId, 'indeterminateOrExtendedSentenceDetails')
  )
  const missingDetails = selected.filter(selectionId => {
    const optionShouldHaveDetails = Boolean(
      findListItemByValue<FormOption>({
        items: formOptions.indeterminateOrExtendedSentenceDetails,
        value: selectionId,
      })?.detailsLabel
    )
    if (
      optionShouldHaveDetails &&
      isEmptyStringOrWhitespace(requestBody[`indeterminateOrExtendedSentenceDetailsDetail-${selectionId}`])
    ) {
      return selectionId
    }
    return false
  })
  const hasError = !indeterminateOrExtendedSentenceDetails || missingDetails.length
  if (hasError) {
    const errors = []
    let errorId
    if (!indeterminateOrExtendedSentenceDetails || invalidAlternative) {
      errorId = 'noIndeterminateDetailsSelected'
      errors.push(
        makeErrorObject({
          id: 'indeterminateOrExtendedSentenceDetails',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingDetails.length) {
      missingDetails.forEach(selectionId => {
        errorId = 'missingIndeterminateDetail'
        errors.push(
          makeErrorObject({
            id: `indeterminateOrExtendedSentenceDetailsDetail-${selectionId}`,
            text: missingDetailsError(selectionId),
            errorId,
          })
        )
      })
    }
    const unsavedValues = {
      indeterminateOrExtendedSentenceDetails: selected.map(selectionId => ({
        value: selectionId,
        details: requestBody[`indeterminateOrExtendedSentenceDetailsDetail-${selectionId}`],
      })),
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    indeterminateOrExtendedSentenceDetails: {
      selected: selected.map(alternative => {
        const details = requestBody[`indeterminateOrExtendedSentenceDetailsDetail-${alternative}`]
        return {
          value: alternative,
          details: details ? stripHtmlTags(details as string) : undefined,
        }
      }),
      allOptions: cleanseUiList(formOptions.indeterminateOrExtendedSentenceDetails),
    },
  }
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'sensitive-info', urlInfo })
  return {
    valuesToSave,
    nextPagePath,
  }
}
