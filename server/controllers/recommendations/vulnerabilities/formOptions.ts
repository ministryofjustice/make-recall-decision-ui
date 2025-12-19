import { VulnerabilityCategory } from './VulnerabilityCategory'

export enum VULNERABILITY {
  NONE_OR_NOT_KNOWN = 'NONE_OR_NOT_KNOWN',
  NONE = 'NONE',
  NOT_KNOWN = 'NOT_KNOWN',
  RISK_OF_SUICIDE_OR_SELF_HARM = 'RISK_OF_SUICIDE_OR_SELF_HARM',
  RELATIONSHIP_BREAKDOWN = 'RELATIONSHIP_BREAKDOWN',
  DOMESTIC_ABUSE = 'DOMESTIC_ABUSE',
  DRUG_OR_ALCOHOL_USE = 'DRUG_OR_ALCOHOL_USE',
  BULLYING_OTHERS = 'BULLYING_OTHERS',
  BEING_BULLIED_BY_OTHERS = 'BEING_BULLIED_BY_OTHERS',
  BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS = 'BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS',
  ADULT_OR_CHILD_SAFEGUARDING_CONCERNS = 'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS',
  MENTAL_HEALTH_CONCERNS = 'MENTAL_HEALTH_CONCERNS',
  PHYSICAL_HEALTH_CONCERNS = 'PHYSICAL_HEALTH_CONCERNS',
  MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION = 'MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION',
  BEREAVEMENT_ISSUES = 'BEREAVEMENT_ISSUES',
  LEARNING_DIFFICULTIES = 'LEARNING_DIFFICULTIES',
  PHYSICAL_DISABILITIES = 'PHYSICAL_DISABILITIES',
  CULTURAL_OR_LANGUAGE_DIFFERENCES = 'CULTURAL_OR_LANGUAGE_DIFFERENCES',
}

export const vulnerabilitiesRiskToSelf = [
  {
    value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
    text: 'At risk of suicide or self-harm',
    detailsLabel: 'Give full details, including any past or recent attempts',
    category: VulnerabilityCategory.SUICIDE_OR_SELF_HARM,
    categoryHint:
      'Consider if {{ fullName }} has a history of self-harm or suicide attempts, or any recent incidents. Think about factors that could trigger an incident, such as separation from family.',
  },
  {
    value: VULNERABILITY.DRUG_OR_ALCOHOL_USE,
    text: 'Drug or alcohol abuse',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.HEALTH_AND_WELLBEING,
  },
  {
    value: VULNERABILITY.MENTAL_HEALTH_CONCERNS,
    text: 'Mental health concerns',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.HEALTH_AND_WELLBEING,
  },
  {
    value: VULNERABILITY.MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION,
    text: 'Medication taken, including compliance with medication',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.HEALTH_AND_WELLBEING,
  },
  {
    value: VULNERABILITY.PHYSICAL_HEALTH_CONCERNS,
    text: 'Physical health concerns',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.HEALTH_AND_WELLBEING,
  },
  {
    value: VULNERABILITY.LEARNING_DIFFICULTIES,
    text: 'Learning difficulties',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.HEALTH_AND_WELLBEING,
  },
  {
    value: VULNERABILITY.PHYSICAL_DISABILITIES,
    text: 'Physical disabilities',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.HEALTH_AND_WELLBEING,
  },
  {
    value: VULNERABILITY.DOMESTIC_ABUSE,
    text: 'Domestic abuse',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RISK_TO_OR_FROM_OTHERS,
  },
  {
    value: VULNERABILITY.ADULT_OR_CHILD_SAFEGUARDING_CONCERNS,
    text: 'Adult or child safeguarding concerns',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RISK_TO_OR_FROM_OTHERS,
  },
  {
    value: VULNERABILITY.BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS,
    text: 'Being at risk of serious harm from others',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RISK_TO_OR_FROM_OTHERS,
  },
  {
    value: VULNERABILITY.BEING_BULLIED_BY_OTHERS,
    text: 'Being bullied by others',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RISK_TO_OR_FROM_OTHERS,
  },
  {
    value: VULNERABILITY.BULLYING_OTHERS,
    text: 'Bullying others',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RISK_TO_OR_FROM_OTHERS,
  },
  {
    value: VULNERABILITY.RELATIONSHIP_BREAKDOWN,
    text: 'Relationship breakdown',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RELATIONSHIPS_FAMILY_COMMUNITY,
  },
  {
    value: VULNERABILITY.BEREAVEMENT_ISSUES,
    text: 'Bereavement issues',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RELATIONSHIPS_FAMILY_COMMUNITY,
  },
  {
    value: VULNERABILITY.CULTURAL_OR_LANGUAGE_DIFFERENCES,
    text: 'Cultural or language differences',
    detailsLabel: 'Give details',
    category: VulnerabilityCategory.RELATIONSHIPS_FAMILY_COMMUNITY,
  },
  {
    value: VULNERABILITY.NONE_OR_NOT_KNOWN,
    text: 'No concerns or do not know',
    behaviour: 'exclusive',
    category: VulnerabilityCategory.NO_CONCERNS,
    items: [
      { value: VULNERABILITY.NONE, text: 'No concerns about vulnerabilities or needs' },
      { value: VULNERABILITY.NOT_KNOWN, text: 'Do not know about vulnerabilities or needs' },
    ],
  },
]

export const vulnerabilities = [
  {
    text: 'None',
    value: VULNERABILITY.NONE,
    behaviour: 'exclusive',
  },
  {
    text: 'Not known',
    value: VULNERABILITY.NOT_KNOWN,
    behaviour: 'exclusive',
  },
  {
    value: VULNERABILITY.RISK_OF_SUICIDE_OR_SELF_HARM,
    text: 'Risk of suicide or self-harm',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.RELATIONSHIP_BREAKDOWN,
    text: 'Relationship breakdown',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.DOMESTIC_ABUSE,
    text: 'Domestic abuse',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.DRUG_OR_ALCOHOL_USE,
    text: 'Drug or alcohol abuse',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.BULLYING_OTHERS,
    text: 'Bullying others',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.BEING_BULLIED_BY_OTHERS,
    text: 'Being bullied by others',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS,
    text: 'Being at risk of serious harm from others',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.ADULT_OR_CHILD_SAFEGUARDING_CONCERNS,
    text: 'Adult or child safeguarding concerns',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.MENTAL_HEALTH_CONCERNS,
    text: 'Mental health concerns',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.PHYSICAL_HEALTH_CONCERNS,
    text: 'Physical health concerns',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION,
    text: 'Medication taken, including compliance with medication',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.BEREAVEMENT_ISSUES,
    text: 'Bereavement issues',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.LEARNING_DIFFICULTIES,
    text: 'Learning difficulties',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.PHYSICAL_DISABILITIES,
    text: 'Physical disabilities',
    detailsLabel: 'Give details',
  },
  {
    value: VULNERABILITY.CULTURAL_OR_LANGUAGE_DIFFERENCES,
    text: 'Cultural or language differences',
    detailsLabel: 'Give details',
  },
]
