import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse, ValueWithDetails } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesAlternativesToRecallTried = ({
  errors,
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    return getProperty<RecommendationResponse, Array<ValueWithDetails>>(apiValues, 'alternativesToRecallTried.selected')
  }
  return unsavedValues.alternativesToRecallTried
}
