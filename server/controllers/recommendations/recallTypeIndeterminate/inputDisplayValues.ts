import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecallType, RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesRecallTypeIndeterminate = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.recallType)) {
    inputDisplayValues.value = (unsavedValues.recallType ||
      getProperty<RecommendationResponse, RecallType>(apiValues, 'recallType.selected.value')) as string
  }
  return inputDisplayValues
}
