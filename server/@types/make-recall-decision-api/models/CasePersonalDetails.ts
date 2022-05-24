/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { PersonDetails } from './PersonDetails'
import { Risk } from './Risk'
import { CurrentAddress } from './CurrentAddress'
import { OffenderManager } from './OffenderManager'

export type PersonalDetailsResponse = {
  personalDetailsOverview: PersonDetails
  currentAddress: CurrentAddress
  offenderManager: OffenderManager
  risk: Risk
}
