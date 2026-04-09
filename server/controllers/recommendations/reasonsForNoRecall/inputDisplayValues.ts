import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { ReasonsForNoRecall } from '../../../@types/make-recall-decision-api/models/ReasonsForNoRecall'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

const inputDisplayValuesReasonsForNoRecall = ({ errors, unsavedValues = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    const details = getProperty<RecommendationResponse, ReasonsForNoRecall>(apiValues, 'reasonsForNoRecall')
    return {
      ...details,
    }
  }
  return unsavedValues
}

export default inputDisplayValuesReasonsForNoRecall
