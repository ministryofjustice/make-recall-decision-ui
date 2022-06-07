/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OffenceWithLicenceConditions } from './OffenceWithLicenceConditions'
import type { PersonDetails } from './PersonDetails'

export type LicenceConditionsResponse = {
  personalDetailsOverview?: PersonDetails
  convictions?: Array<OffenceWithLicenceConditions>
}
