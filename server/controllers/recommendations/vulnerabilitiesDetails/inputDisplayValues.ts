import { RecommendationResponse, ValueWithDetails } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'
import { getProperty, isDefined } from '../../../utils/utils'

export const inputDisplayValuesVulnerabilitiesDetails = ({
  errors,
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    return getProperty<RecommendationResponse, ValueWithDetails[]>(apiValues, 'vulnerabilities.selected')
  }
  return unsavedValues.vulnerabilities
}
