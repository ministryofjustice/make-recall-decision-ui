/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ContactSummaryResponse } from './ContactSummaryResponse'
import type { PersonDetails } from './PersonDetails'
import type { ReleaseSummaryResponse } from './ReleaseSummaryResponse'

export type LicenceHistoryResponse = {
  personalDetailsOverview?: PersonDetails
  contactSummary?: Array<ContactSummaryResponse>
  releaseSummary?: ReleaseSummaryResponse
}
