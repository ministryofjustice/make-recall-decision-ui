/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ContactSummaryResponse } from './ContactSummaryResponse'
import type { PersonDetails } from './PersonDetails'
import type { ReleaseSummaryResponse } from './ReleaseSummaryResponse'
import { ContactTypeGroup } from './ContactTypeGroup'

export type LicenceHistoryResponse = {
  personalDetailsOverview?: PersonDetails
  contactTypeGroups?: Array<ContactTypeGroup>
  contactSummary?: Array<ContactSummaryResponse>
  releaseSummary?: ReleaseSummaryResponse
}
