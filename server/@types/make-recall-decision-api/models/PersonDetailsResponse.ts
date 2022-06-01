/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CurrentAddress } from './CurrentAddress'
import type { OffenderManager } from './OffenderManager'
import type { PersonDetails } from './PersonDetails'

export type PersonDetailsResponse = {
  personalDetailsOverview?: PersonDetails
  currentAddress?: CurrentAddress
  offenderManager?: OffenderManager
}
