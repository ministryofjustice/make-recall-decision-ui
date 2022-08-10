import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { CustodyStatus, RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesCustodyStatus = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.custodyStatus)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, CustodyStatus>(apiValues, 'custodyStatus')?.selected
  }
  return inputDisplayValues
}
