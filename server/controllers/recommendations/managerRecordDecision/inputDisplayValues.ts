import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { ManagerRecallDecisionTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/ManagerRecallDecisionTypeSelectedValue'

export const inputDisplayValuesManagerRecordDecision = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
    detail: '',
  }
  if (!isDefined(errors.recallTypeManager)) {
    inputDisplayValues.value =
      ((unsavedValues.recallTypeManager ||
        getProperty<RecommendationResponse, ManagerRecallDecisionTypeSelectedValue>(
          apiValues,
          'managerRecallDecision.selected.value'
        )) as string) || ''
  }
  if (!isDefined(errors.recallTypeManagerDetail)) {
    inputDisplayValues.detail =
      (unsavedValues.recallTypeManagerDetail as string) ||
      getProperty<RecommendationResponse, string>(apiValues, 'managerRecallDecision.selected.details') ||
      ''
  }
  return inputDisplayValues
}
