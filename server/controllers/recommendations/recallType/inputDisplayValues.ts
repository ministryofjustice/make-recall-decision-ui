import { getProperty, isDefined } from '../../../utils/utils'
import { RecallType, RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesRecallType = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
    details: '',
  }
  if (!isDefined(errors.recallType)) {
    inputDisplayValues.value = (unsavedValues.recallType ||
      getProperty<RecommendationResponse, RecallType>(apiValues, 'recallType.selected.value')) as string

    if (!isDefined(errors.recallTypeDetailsFixedTerm) && !isDefined(errors.recallTypeDetailsStandard)) {
      inputDisplayValues.details = getProperty<RecommendationResponse, RecallType>(
        apiValues,
        'recallType.selected.details'
      ) as string
    }
  }
  return inputDisplayValues
}
