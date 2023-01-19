import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesRosh = ({ errors = {}, unsavedValues, apiValues }: InputDisplayValuesArgs) => {
  if (!Object.keys(errors).length) {
    return getProperty<RecommendationResponse, boolean>(apiValues, 'currentRoshForPartA')
  }
  return unsavedValues
}
