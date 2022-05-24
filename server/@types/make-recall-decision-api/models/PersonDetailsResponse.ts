/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CurrentAddress } from './CurrentAddress'
import type { OffenderManager } from './OffenderManager'
import type { PersonDetails } from './PersonDetails'
import type { Risk } from './Risk'

export type PersonDetailsResponse = {
  personalDetailsOverview?: PersonDetails
  currentAddress?: CurrentAddress
  risk?: Risk
  offenderManager?: OffenderManager
}
