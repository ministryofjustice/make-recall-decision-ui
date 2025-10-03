import { VulnerabilitiesRecommendation } from '../../../@types/make-recall-decision-api'
import { formOptions } from '../formOptions/formOptions'
import { vulnerabilitiesToDisplay } from './vulnerabilitiesToDisplay'

describe('vulnerabilitiesToDisplay', () => {
  it('returns a list of selected vulnerabilities', () => {
    const vulnerabilities: VulnerabilitiesRecommendation = {
      selected: [
        {
          value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
          details: '',
        },
      ],
      allOptions: formOptions.vulnerabilities,
    }

    const result = vulnerabilitiesToDisplay(vulnerabilities)

    expect(result).toEqual([
      {
        value: 'RISK_OF_SUICIDE_OR_SELF_HARM',
        detailsLabel: 'Give details',
        text: 'Risk of suicide or self-harm',
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
