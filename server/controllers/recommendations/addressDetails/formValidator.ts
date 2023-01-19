import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateAddress = async ({ requestBody, recommendationId }: FormValidatorArgs): FormValidatorReturn => {
  const { isMainAddressWherePersonCanBeFound, isMainAddressWherePersonCanBeFoundDetailsNo, addressCount } = requestBody
  const noMainAddresses = addressCount === '0'
  const invalidSelection = !isValueValid(isMainAddressWherePersonCanBeFound as string, 'yesNo')
  const isNo = isMainAddressWherePersonCanBeFound === 'NO' || noMainAddresses
  const missingNoDetail = isNo && isEmptyStringOrWhitespace(isMainAddressWherePersonCanBeFoundDetailsNo)

  const hasError = noMainAddresses
    ? missingNoDetail
    : !isMainAddressWherePersonCanBeFound || invalidSelection || missingNoDetail

  if (hasError) {
    const errors = []
    let errorId
    if (!noMainAddresses && (!isMainAddressWherePersonCanBeFound || invalidSelection)) {
      errorId = 'noAddressConfirmationSelected'
      errors.push(
        makeErrorObject({
          id: 'isMainAddressWherePersonCanBeFound',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingNoDetail) {
      errorId = 'missingLocationDetail'
      errors.push(
        makeErrorObject({
          id: 'isMainAddressWherePersonCanBeFoundDetailsNo',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    const unsavedValues = {
      isMainAddressWherePersonCanBeFound,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    isMainAddressWherePersonCanBeFound: {
      selected: isMainAddressWherePersonCanBeFound === 'YES',
      details: isNo ? stripHtmlTags(isMainAddressWherePersonCanBeFoundDetailsNo as string) : null,
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`,
  }
}
