import { VulnerabilitiesRecommendation } from '../../../@types/make-recall-decision-api'
import { formOptions } from '../formOptions/formOptions'
import vulnerabilitiesToDisplay from './vulnerabilitiesToDisplay'
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
        detailsLabel: 'Give full details, including any past or recent attempts',
        text: 'At risk of suicide or self-harm',
        category: 'Suicide or self-harm',
        categoryHint:
          'Consider if {{ fullName | safe }} has a history of self-harm or suicide attempts, or any recent incidents. Think about factors that could trigger an incident, such as separation from family.',
      },
      {
        category: 'Health and wellbeing',
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
