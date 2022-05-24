/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { PersonDetails } from './PersonDetails'
import { Offence } from './Offence'

export type CaseSummaryOverviewResponse = {
  personalDetailsOverview: PersonDetails
  offences: Offence[]
}
