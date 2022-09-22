import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { ReasonsForNoRecall } from '../../../@types/make-recall-decision-api/models/ReasonsForNoRecall'

export const inputDisplayValuesReasonsForNoRecall = ({
  errors,
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    const details = getProperty<RecommendationResponse, ReasonsForNoRecall>(apiValues, 'reasonsForNoRecall')
    return {
      ...details,
    }
  }
  return unsavedValues
}
