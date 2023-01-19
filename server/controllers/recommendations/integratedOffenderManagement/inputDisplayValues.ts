import { getProperty, isDefined } from '../../../utils/utils'
import { VictimsInContactScheme, RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesIntegratedOffenderManagement = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.isUnderIntegratedOffenderManagement)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, VictimsInContactScheme>(
      apiValues,
      'isUnderIntegratedOffenderManagement'
    )?.selected
  }
  return inputDisplayValues
}
