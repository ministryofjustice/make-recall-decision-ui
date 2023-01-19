import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { LocalPoliceContact } from '../../../@types/make-recall-decision-api/models/LocalPoliceContact'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesLocalPoliceContactDetails = ({
  errors,
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    const details = getProperty<RecommendationResponse, LocalPoliceContact>(apiValues, 'localPoliceContact')
    return {
      ...details,
    }
  }
  return unsavedValues
}
