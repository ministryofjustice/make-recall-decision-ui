/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LicenceConditionTypeMainCat } from './LicenceConditionTypeMainCat'
import type { LicenceConditionTypeSubCat } from './LicenceConditionTypeSubCat'

export type LicenceCondition = {
  startDate?: string
  terminationDate?: string
  createdDateTime?: string
  active?: boolean
  licenceConditionNotes?: string
  licenceConditionTypeMainCat?: LicenceConditionTypeMainCat
  licenceConditionTypeSubCat?: LicenceConditionTypeSubCat
}
