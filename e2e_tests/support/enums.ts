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

export enum ROSHLevels {
  'LOW' = 'Low',
  'MEDIUM' = 'Medium',
  'HIGH' = 'High',
  'VERY_HIGH' = 'Very High',
  'NOT_APPLICABLE' = 'N/A',
}

export enum LicenceConditions {
  GOOD_BEHAVIOUR = 'be of good behaviour and not behave in a way which undermines the purpose of the licence period;',
  NO_OFFENCE = 'not to commit any offence;',
  KEEP_IN_TOUCH = 'keep in touch with the supervising officer in accordance with instructions given by the supervising officer;',
  SUPERVISING_OFFICER_VISIT = 'receive visits from the supervising officer in accordance with instructions given by the supervising officer;',
  ADDRESS_APPROVED = 'reside permanently at an address approved by the supervising officer and obtain prior permission of the supervising officer for any stay of one or more nights at a different address;',
  NO_WORK_UNDERTAKEN = 'not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work;',
  NO_TRAVEL_OUTSIDE_UK = 'not to travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purpose of immigration deportation or removal.',
  NAME_CHANGE = 'Tell your supervising officer if you use a name which is different to the name or names which appear on your licence.',
  CONTACT_DETAILS = 'Tell your supervising officer if you change or add any contact details, including phone number or email.',
  'NLC8|NSTT8' = 'To only attend places of worship which have been previously agreed with your supervising officer.',
}

export enum WhyConsiderRecall {
  INCREASED_RIS = 'Your risk is assessed as increased',
  CONTACT_WITH_PO_BROKEN = 'Contact with your probation practitioner has broken down',
  RISK_AND_CONTACT_BROKEN = 'Your risk is assessed as increased and contact with your probation practitioner has broken down',
}

export enum ApptOptions {
  TELEPHONE = 'Telephone',
  VIDEO = 'Video call',
  OFFICE = 'Office visit',
  HOME = 'Home visit',
}
