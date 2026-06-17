import { FormOption, formOptions } from '../formOptions/formOptions'

export function availableRecallTypes(): FormOption[] {
  return formOptions.recallType.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
}

export function availableRecallTypesForRecommendation(): FormOption[] {
  return availableRecallTypes()
}
