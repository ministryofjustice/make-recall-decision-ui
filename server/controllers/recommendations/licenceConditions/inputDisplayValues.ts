import { isDefined } from '../../../utils/utils'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesLicenceConditions = ({ errors, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors) && apiValues.licenceConditionsBreached) {
    const { standardLicenceConditions, additionalLicenceConditions } = apiValues.licenceConditionsBreached
    return {
      standardLicenceConditions: standardLicenceConditions?.selected,
      additionalLicenceConditions: additionalLicenceConditions?.selectedOptions,
    }
  }
  return {
    standardLicenceConditions: undefined,
    additionalLicenceConditions: undefined,
  }
}
