/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LicenceCondition } from './LicenceCondition'
import type { Offence } from './Offence'

export type OffenceWithLicenceConditions = {
  convictionId?: number
  active?: boolean
  offences?: Array<Offence>
  sentenceDescription?: string
  sentenceOriginalLength?: number
  sentenceOriginalLengthUnits?: string
  sentenceStartDate?: string
  licenceExpiryDate?: string
  postSentenceSupervisionEndDate?: string
  statusCode?: string
  statusDescription?: string
  licenceConditions?: Array<LicenceCondition>
}
