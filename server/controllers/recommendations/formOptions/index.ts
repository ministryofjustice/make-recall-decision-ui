import { recallType } from './recallType'
import { custodyStatus } from './custodyStatus'
import { UiListItem } from '../../../@types'
import { standardLicenceConditions } from './licenceConditions'

export const formOptions = {
  recallType,
  standardLicenceConditions,
  custodyStatus,
}

export const isValueValid = (val: string, optionId: string) =>
  formOptions[optionId].find((option: UiListItem) => option.value === val)
