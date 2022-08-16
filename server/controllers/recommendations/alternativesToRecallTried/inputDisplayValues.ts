import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse, SelectedAlternative } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesAlternativesToRecallTried = ({
  errors,
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    return getProperty<RecommendationResponse, Array<SelectedAlternative>>(
      apiValues,
      'alternativesToRecallTried.selected'
    )
  }
  return unsavedValues.alternativesToRecallTried
}
