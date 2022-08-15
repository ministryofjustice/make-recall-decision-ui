import { recallType } from '../recallType/formOptions'
import { custodyStatus } from '../custodyStatus/formOptions'
import { isThisAnEmergencyRecall } from '../emergencyRecall/formOptions'
import { UiListItem } from '../../../@types'
import { standardLicenceConditions } from '../formOptions/licenceConditions'
import { hasVictimsInContactScheme } from '../victimContactScheme/formOptions'

export const formOptions = {
  recallType,
  standardLicenceConditions,
  isThisAnEmergencyRecall,
  custodyStatus,
  hasVictimsInContactScheme,
}

export const isValueValid = (val: string, optionId: string) =>
  formOptions[optionId].find((option: UiListItem) => option.value === val)
