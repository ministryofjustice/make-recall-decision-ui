/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { Offender } from './Offender'
import { Address } from './Address'
import { Offence } from './Offence'
import { OffenderManager } from './OffenderManager'
import { RiskFlag } from './Risk'
import { RiskOfSeriousHarm } from './RiskOfSeriousHarm'

export type Case = {
  personDetails: Offender
  currentAddress: Address
  offences: Offence[]
  offenderManager: OffenderManager
  risk: {
    riskFlags: RiskFlag[]
    riskOfSeriousHarm: RiskOfSeriousHarm
  }
}
