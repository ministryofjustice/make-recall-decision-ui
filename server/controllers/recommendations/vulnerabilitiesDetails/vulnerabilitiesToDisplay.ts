import { VulnerabilitiesRecommendation } from '../../../@types/make-recall-decision-api'
import { formOptions } from '../formOptions/formOptions'

export const vulnerabilitiesToDisplay = (vulnerabilities: VulnerabilitiesRecommendation) => {
  const { selected, allOptions } = vulnerabilities || {}
  const selectedOptions = allOptions?.filter(val => selected.find(selectedVal => selectedVal.value === val.value)) || []
  const { vulnerabilitiesRiskToSelf: formOptionVulnerabilities } = formOptions

  return selectedOptions.reduce((acc, opt) => {
    acc.push({
      ...opt,
      detailsLabel: formOptionVulnerabilities.find(val => val.value === opt.value)?.detailsLabel,
    })
    return acc
  }, [])
}
