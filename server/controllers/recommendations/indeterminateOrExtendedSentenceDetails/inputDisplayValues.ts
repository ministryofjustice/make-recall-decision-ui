import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse, ValueWithDetails } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

const inputDisplayValuesIndeterminateDetails = ({ errors, unsavedValues = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    return getProperty<RecommendationResponse, Array<ValueWithDetails>>(
      apiValues,
      'indeterminateOrExtendedSentenceDetails.selected',
    )
  }
  return unsavedValues.indeterminateOrExtendedSentenceDetails
}

export default inputDisplayValuesIndeterminateDetails
