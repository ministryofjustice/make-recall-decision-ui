import { getCaseSummary } from '../../../data/makeDecisionApiClient'
import { LicenceConditionsResponse } from '../../../@types/make-recall-decision-api'
import { isCaseRestrictedOrExcluded } from '../../../utils/utils'
import {
  TransformedLicenceConditionsResponse,
  transformLicenceConditions,
} from '../../caseSummary/licenceConditions/transformLicenceConditions'

export const fetchAndTransformLicenceConditions = async ({
  crn,
  token,
}: {
  crn: string
  token: string
}): Promise<LicenceConditionsResponse | TransformedLicenceConditionsResponse> => {
  const response = await getCaseSummary<LicenceConditionsResponse>(crn, 'licence-conditions', token)
  if (isCaseRestrictedOrExcluded(response.userAccessResponse)) {
    return response
  }
  return transformLicenceConditions(response)
}
