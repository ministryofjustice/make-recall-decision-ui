export enum YesNoType {
  'YES' = 'Yes',
  'NO' = 'No',
}

export enum YesNoNAType {
  'YES' = 'Yes',
  'NO' = 'No',
  'NOT_APPLICABLE' = 'N/A',
}

export enum CustodyType {
  'YES_POLICE' = 'Police Custody',
  'YES_PRISON' = 'Prison Custody',
  'NO' = 'No',
}

export enum NonIndeterminateRecallType {
  'STANDARD' = 'Standard',
  'FIXED_TERM' = 'Fixed',
  'NO_RECALL' = 'No recall',
}
export enum IndeterminateRecallType {
  'EMERGENCY' = 'Emergency recall',
  'NO_RECALL' = 'No recall',
}

export enum IndeterminateOrExtendedSentenceDetailType {
  'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE' = '{{offenderName}} has shown behaviour similar to the index offence',
  'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE' = '{{offenderName}} has shown behaviour that could lead to a sexual or violent offence',
  'OUT_OF_TOUCH' = '{{offenderName}} is out of touch',
}

export enum Vulnerabilities {
  'NONE' = 'None',
  'NOT_KNOWN' = 'Not known',
  'RISK_OF_SUICIDE_OR_SELF_HARM' = 'Risk of suicide or self-harm',
  'RELATIONSHIP_BREAKDOWN' = 'Relationship breakdown',
  'DOMESTIC_ABUSE' = 'Domestic abuse',
  'DRUG_OR_ALCOHOL_USE' = 'Drug or alcohol abuse',
  'BULLYING_OTHERS' = 'Bullying others',
  'BEING_BULLIED_BY_OTHERS' = 'Being bullied by others',
  'BEING_AT_RISK_OF_SERIOUS_HARM_FROM_OTHERS' = 'Being at risk of serious harm from others',
  'ADULT_OR_CHILD_SAFEGUARDING_CONCERNS' = 'Adult or child safeguarding concerns',
  'MENTAL_HEALTH_CONCERNS' = 'Mental health concerns',
  'PHYSICAL_HEALTH_CONCERNS' = 'Physical health concerns',
  'MEDICATION_TAKEN_INCLUDING_COMPLIANCE_WITH_MEDICATION' = 'Medication taken, including compliance with medication',
  'BEREAVEMENT_ISSUES' = 'Bereavement issues',
  'LEARNING_DIFFICULTIES' = 'Learning difficulties',
  'PHYSICAL_DISABILITIES' = 'Physical disabilities',
  'CULTURAL_OR_LANGUAGE_DIFFERENCES' = 'Cultural or language differences',
}
