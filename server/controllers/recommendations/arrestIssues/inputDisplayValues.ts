import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs, ValueWithDetails } from '../../../@types/pagesForms'

export const inputDisplayValuesArrestIssues = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: undefined,
    details: '',
  } as ValueWithDetails
  if (!isDefined(errors.hasArrestIssues)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(apiValues, 'hasArrestIssues.selected')
    inputDisplayValues.value = (unsavedValues.hasArrestIssues as string) || booleanToYesNo(apiValue)

    if (!isDefined(errors.hasArrestIssuesDetailsYes)) {
      inputDisplayValues.details = getProperty<RecommendationResponse, string>(
        apiValues,
        'hasArrestIssues.details'
      ) as string
    }
  }
  return inputDisplayValues
}
