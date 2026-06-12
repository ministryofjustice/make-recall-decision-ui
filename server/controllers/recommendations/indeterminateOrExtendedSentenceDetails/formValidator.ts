import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import strings from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'
import { nextPageLinkUrl } from '../helpers/urls'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { UiFormOption, FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

const errorsFtr56: Record<string, string> = {
  BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE: strings.errors.missingIndeterminateDetailIndexOffenceFtr56,
  BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE: strings.errors.missingIndeterminateDetailSexualViolentFtr56,
  BEHAVIOUR_LIKELY_TO_RESULT_SEXUAL_OR_VIOLENT_OFFENCE:
    strings.errors.missingIndeterminateDetailLikelyResultSexualViolent,
  OUT_OF_TOUCH: strings.errors.missingIndeterminateDetailContact,
}

const missingDetailsError = (optionId: string) => {
  const map = errorsFtr56
  return map[optionId] ?? 'Enter details'
}

const validateIndeterminateDetails = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { indeterminateOrExtendedSentenceDetails } = requestBody
  const selected = Array.isArray(indeterminateOrExtendedSentenceDetails)
    ? indeterminateOrExtendedSentenceDetails
    : [indeterminateOrExtendedSentenceDetails]

  const items = formOptions.indeterminateOrExtendedSentenceDetailsFtr56
  const formId = 'indeterminateOrExtendedSentenceDetailsFtr56'

  const invalidAlternative = selected.some(selectionId => !isValueValid(selectionId, formId))
  const missingDetails = selected.filter(selectionId => {
    const optionShouldHaveDetails = Boolean(
      findListItemByValue<UiFormOption>({
        items,
        value: selectionId,
      })?.detailsLabel,
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
      errorId = 'noIndeterminateDetailsSelectedFtr56'
      errors.push(
        makeErrorObject({
          id: 'option-1',
          name: 'indeterminateOrExtendedSentenceDetails',
          text: strings.errors[errorId],
          errorId,
        }),
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
          }),
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
      allOptions: cleanseUiList(items),
    },
  }
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'sensitive-info', urlInfo })
  return {
    valuesToSave,
    nextPagePath,
  }
}

export default validateIndeterminateDetails
