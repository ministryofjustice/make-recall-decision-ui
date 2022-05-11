/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { Offender } from './Offender'
import { RiskFlag } from './Risk'
import { RiskOfSeriousHarm } from './RiskOfSeriousHarm'
import { Address } from './Address'
import { OffenderManager } from './OffenderManager'

export type CasePersonalDetails = {
  personDetails: Offender
  currentAddress: Address
  offenderManager: OffenderManager
  risk: {
    riskFlags: RiskFlag[]
    riskOfSeriousHarm: RiskOfSeriousHarm
  }
}
