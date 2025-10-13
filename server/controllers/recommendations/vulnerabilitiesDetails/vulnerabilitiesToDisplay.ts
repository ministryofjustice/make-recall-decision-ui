import { TextValueOption, VulnerabilitiesRecommendation } from '../../../@types/make-recall-decision-api'

export const vulnerabilitiesToDisplay = (vulnerabilities: VulnerabilitiesRecommendation): TextValueOption[] => {
  const { selected, allOptions } = vulnerabilities || {}
  return allOptions?.filter(val => selected.find(selectedVal => selectedVal.value === val.value)) || []
}
