import { VulnerabilitiesResponse } from '../../../@types/make-recall-decision-api/models/VulnerabilitiesResponse'
import { Vulnerabilities } from '../../../@types/make-recall-decision-api'

interface DecoratedVulnerabilitiesResponse extends VulnerabilitiesResponse {
  vulnerabilities?: Vulnerabilities & { noData?: boolean }
}

export const transformVulnerabilities = (caseSummary: VulnerabilitiesResponse): DecoratedVulnerabilitiesResponse => {
  if (caseSummary.vulnerabilities.error) {
    return caseSummary
  }
  const noData = ['suicide', 'selfHarm', 'vulnerability', 'custody', 'hostelSetting'].every(key => {
    return caseSummary.vulnerabilities[key]?.current === null && caseSummary.vulnerabilities[key]?.previous === null
  })

  return {
    ...caseSummary,
    vulnerabilities: {
      ...caseSummary.vulnerabilities,
      noData,
    },
  }
}
