import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse, ValueWithDetails } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

const inputDisplayValuesVulnerabilities = ({ errors, unsavedValues = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors)) {
    return getProperty<RecommendationResponse, Array<ValueWithDetails>>(apiValues, 'vulnerabilities.selected')
  }
  return unsavedValues.vulnerabilities
}

export default inputDisplayValuesVulnerabilities
