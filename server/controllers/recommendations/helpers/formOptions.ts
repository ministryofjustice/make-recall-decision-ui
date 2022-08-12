import { recallType } from '../recallType/formOptions'
import { custodyStatus } from '../custodyStatus/formOptions'
import { isThisAnEmergencyRecall } from '../emergencyRecall/formOptions'
import { UiListItem } from '../../../@types'
import { standardLicenceConditions } from '../formOptions/licenceConditions'

export const formOptions = {
  recallType,
  standardLicenceConditions,
  isThisAnEmergencyRecall,
  custodyStatus,
}

export const isValueValid = (val: string, optionId: string) =>
  formOptions[optionId].find((option: UiListItem) => option.value === val)
