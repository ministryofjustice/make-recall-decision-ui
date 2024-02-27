import { isDefined } from '../../../utils/utils'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesLicenceConditions = ({ errors, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors) && apiValues.licenceConditionsBreached) {
    const { standardLicenceConditions, additionalLicenceConditions } = apiValues.licenceConditionsBreached
    return {
      standardLicenceConditions: standardLicenceConditions?.selected,
      additionalLicenceConditions: additionalLicenceConditions?.selectedOptions,
      additionalLicenceConditionsText: apiValues.additionalLicenceConditionsText,
    }
  }
  if (!isDefined(errors) && apiValues.cvlLicenceConditionsBreached) {
    const { standardLicenceConditions, additionalLicenceConditions, bespokeLicenceConditions } =
      apiValues.cvlLicenceConditionsBreached

    return {
      standardLicenceConditions: standardLicenceConditions?.selected,
      additionalLicenceConditions: additionalLicenceConditions?.selected,
      bespokeLicenceConditions: bespokeLicenceConditions?.selected,
      additionalLicenceConditionsText: apiValues.additionalLicenceConditionsText,
    }
  }
  if (!isDefined(errors) && !!apiValues.additionalLicenceConditionsText?.length)
    return {
      standardLicenceConditions: undefined,
      additionalLicenceConditions: undefined,
      additionalLicenceConditionsText: apiValues.additionalLicenceConditionsText,
    }

  return {
    standardLicenceConditions: undefined,
    additionalLicenceConditions: undefined,
    additionalLicenceConditionsText: undefined,
  }
}
