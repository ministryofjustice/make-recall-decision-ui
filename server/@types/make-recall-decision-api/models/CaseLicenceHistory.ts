/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { Offender } from './Offender'
import { ContactSummary } from './ContactSummary'

export type CaseLicenceHistory = {
  personalDetailsOverview: Offender
  contactSummary: ContactSummary[]
}
