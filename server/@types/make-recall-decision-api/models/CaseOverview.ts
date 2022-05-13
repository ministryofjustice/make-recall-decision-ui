/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { Offender } from './Offender'
import { Offence } from './Offence'

export type CaseOverview = {
  personalDetailsOverview: Offender
  offences: Offence[]
}
