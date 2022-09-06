import { InputDisplayValuesArgs, ValueWithDetails } from '../../../@types'
import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { CustodyStatus, RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesCustodyStatus = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: undefined,
    details: '',
  } as ValueWithDetails
  if (!isDefined(errors.custodyStatus)) {
    const apiValue = getProperty<RecommendationResponse, CustodyStatus.selected>(apiValues, 'custodyStatus.selected')
    inputDisplayValues.value = (unsavedValues.custodyStatus as string) || apiValue

    if (!isDefined(errors.custodyStatusDetailsYesPolice)) {
      inputDisplayValues.details = getProperty<RecommendationResponse, string>(
        apiValues,
        'custodyStatus.details'
      ) as string
    }
  }
  return inputDisplayValues
}

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
