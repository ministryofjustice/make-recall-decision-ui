import { VulnerabilitiesRecommendation } from '../../../@types/make-recall-decision-api'
import { formOptions } from '../formOptions/formOptions'
import { vulnerabilitiesToDisplay } from './vulnerabilitiesToDisplay'
import { VULNERABILITY } from '../vulnerabilities/formOptions'

describe('vulnerabilitiesToDisplay', () => {
  it('returns a list of selected vulnerabilities', () => {
    const vulnerabilities: VulnerabilitiesRecommendation = {
      selected: [
        {
          value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
          details: '',
        },
        {
          value: VULNERABILITY.DRUG_OR_ALCOHOL_USE,
          details: '',
        },
      ],
      allOptions: formOptions.vulnerabilities,
    }

    const result = vulnerabilitiesToDisplay(vulnerabilities)

    expect(result).toEqual([
      {
        value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
        detailsLabel: 'Give details, for example a history of self-harm.',
        text: 'Risk of suicide or self-harm',
      },
      {
        value: VULNERABILITY.DRUG_OR_ALCOHOL_USE,
        detailsLabel: 'Give details',
        text: 'Drug or alcohol abuse',
      },
    ])
  })

  it('handles having nothing selected', () => {
    const vulnerabilities: VulnerabilitiesRecommendation = {
      selected: [],
      allOptions: formOptions.vulnerabilities,
    }

    const result = vulnerabilitiesToDisplay(vulnerabilities)

    expect(result).toEqual([])
  })
})
