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
  if (!isDefined(errors) && apiValues.cvlLicenceConditionsBreached) {
    const { standardLicenceConditions, additionalLicenceConditions, bespokeLicenceConditions } =
      apiValues.cvlLicenceConditionsBreached

    return {
      standardLicenceConditions: standardLicenceConditions?.selected,
      additionalLicenceConditions: additionalLicenceConditions?.selected,
      bespokeLicenceConditions: bespokeLicenceConditions?.selected,
    }
  }
  return {
    standardLicenceConditions: undefined,
    additionalLicenceConditions: undefined,
  }
}
