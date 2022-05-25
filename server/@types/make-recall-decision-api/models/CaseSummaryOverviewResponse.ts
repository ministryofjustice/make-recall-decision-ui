/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Offence } from './Offence'
import type { PersonDetails } from './PersonDetails'

export type CaseSummaryOverviewResponse = {
  personalDetailsOverview?: PersonDetails
  offences?: Array<Offence>
}
