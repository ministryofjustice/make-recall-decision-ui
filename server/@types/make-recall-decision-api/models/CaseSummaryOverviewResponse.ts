/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Offence } from './Offence'
import type { PersonDetails } from './PersonDetails'
import type { Risk } from './Risk'

export type CaseSummaryOverviewResponse = {
  personalDetailsOverview?: PersonDetails
  offences?: Array<Offence>
  risk?: Risk
}
