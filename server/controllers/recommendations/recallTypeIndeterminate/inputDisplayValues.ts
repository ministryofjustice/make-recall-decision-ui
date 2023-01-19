import { getProperty, isDefined } from '../../../utils/utils'
import { RecallType, RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesRecallTypeIndeterminate = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.recallType)) {
    if (unsavedValues.recallType) {
      inputDisplayValues.value = unsavedValues.recallType as string
    } else {
      const recallType = getProperty<RecommendationResponse, RecallType>(
        apiValues,
        'recallType.selected.value'
      ) as string
      const isEmergencyRecall = apiValues.isThisAnEmergencyRecall
      inputDisplayValues.value = recallType === 'STANDARD' && isEmergencyRecall === true ? 'EMERGENCY' : recallType
    }
  }
  return inputDisplayValues
}
