export const strings = {
  errors: {
    missingCrn: 'Enter a Case Reference Number (CRN)',
    invalidCrnFormat: 'Enter a Case Reference Number (CRN) in the correct format, for example X12345',
    saveChanges: 'An error occurred saving your changes',
    noRecallTypeSelected: 'You must select a recommendation',
    noRecallTypeIndeterminateSelected: 'Select whether you recommend a recall or not',
    missingRecallTypeDetail: 'You must explain why you recommend this recall type',
    missingCustodyPoliceAddressDetail: 'Enter the custody address',
    noCustodyStatusSelected: 'Select whether the person is in custody or not',
    noEmergencyRecallSelected: 'You must select whether this is an emergency recall or not',
    noIsIndeterminateSelected: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
    noIsExtendedSelected: 'Select whether {{ fullName }} is on an extended sentence or not',
    noIndeterminateSentenceTypeSelected: 'Select whether {{ fullName }} is on a life, IPP or DPP sentence',
    noVictimContactSchemeSelected: 'You must select whether there are any victims in the victim contact scheme',
    noIntegratedOffenderManagementSelected:
      'You must select whether {{ fullName }} is under Integrated Offender Management',
    noAlternativesTriedSelected: 'You must select which alternatives to recall have been tried already',
    noIndeterminateDetailsSelected: 'Select at least one of the criteria',
    missingIndeterminateDetailIndexOffence: 'Enter details about the behaviour similar to the index offence',
    missingIndeterminateDetailSexualViolent:
      'Enter details about the behaviour that could lead to a sexual or violent offence',
    missingIndeterminateDetailContact: 'Enter details about {{ fullName }} being out of touch',
    noVulnerabilitiesSelected: 'Select if there are vulnerabilities or additional needs',
    missingDetail: 'Enter more detail',
    missingResponseToProbation: 'You must explain how {{ fullName }} has responded to probation',
    missingWhatLedToRecall: 'Enter details of what has led to this recall',
    noArrestIssuesSelected: "Select whether there's anything the police should know",
    missingArrestIssuesDetail: 'You must enter details of the arrest issues',
    noFixedTermLicenceConditionsSelected: 'Select whether there are additional licence conditions',
    missingFixedTermLicenceConditionsDetail: 'Enter additional licence conditions',
    noContrabandSelected: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
    missingContrabandDetail: 'You must enter details of the contraband concerns',
    noLicenceConditionsSelected: 'You must select one or more licence conditions',
    invalidConvictionCount: 'Invalid conviction count',
    excludedRestrictedCrn: 'This CRN is excluded or restricted',
    hasMultipleActiveCustodial: 'This person has multiple active custodial convictions',
    noActiveCustodial: 'This person has no active custodial convictions',
    noLocalPoliceName: 'Enter the police contact name',
    invalidLocalPoliceEmail: 'Enter an email address in the correct format, like name@example.com',
    invalidPhoneNumber: 'Enter a telephone number, like 01277 960 001, 07364 900 982 or +44 808 157 0192',
    invalidLocalPoliceFax: 'Enter a fax number, like 01277 960 001, 07364 900 982 or +44 808 157 0192',
    noWhyConsideredRecallSelected: 'Select a reason why you considered recall',
    noRecallLicenceBreachDetails: 'You must explain the licence breach',
    noRecallRationale: 'You must explain your rationale for not recalling {{ fullName }}',
    noRecallPopProgressMade: 'You must explain what progress {{ fullName }} has made so far',
    noRecallFutureExpectations: 'You must explain what is expected in the future',
    noAppointmentTypeSelected: 'You must select how the appointment will happen',
    missingProbationPhoneNumber: 'You must give a telephone number for probation',
    noAddressConfirmationSelected: 'Select whether this is where the police can find {{ fullName }}',
    missingLocationDetail: 'You must enter the correct location',
  },
  pageHeadings: {
    responseToProbation: 'How has {{ fullName }} responded to probation so far?',
    licenceConditions: 'What licence conditions has {{ fullName }} breached?',
    alternativesToRecallTried: 'What alternatives to recall have been tried already?',
    stopThink: 'Stop and think',
    isIndeterminateSentence: 'Is {{ fullName }} on an indeterminate sentence?',
    isExtendedSentence: 'Is {{ fullName }} on an extended sentence?',
    indeterminateSentenceType: 'What type of sentence is {{ fullName }} on?',
    indeterminateOrExtendedSentenceDetails: 'Indeterminate and extended sentences',
    recallType: 'What do you recommend?',
    sensitiveInformation: 'Sensitive information',
    emergencyRecall: 'Is this an emergency recall?',
    custodyStatus: 'Is {{ fullName }} in custody now?',
    vulnerabilities: 'Consider vulnerability and additional needs. Which of these would recall affect?',
    taskList: 'Create a Part A form',
    fixedTermLicenceConditions: 'Fixed term recall',
    integratedOffenderManagement: 'Is {{ fullName }} under Integrated Offender Management (IOM)?',
    localPoliceContactDetails: 'Local police contact details',
    victimContactScheme: 'Are there any victims in the victim contact scheme?',
    victimLiaisonOfficer: 'Victim Liaison Officer (VLO)',
    whatLedToRecall: 'What has led to this recall?',
    addressDetails: 'Address details',
    arrestIssues: 'Is there anything the police should know before they arrest {{ fullName }}?',
    contraband: 'Do you think {{ fullName }} is using recall to bring contraband into prison?',
    confirmationPartA: 'Part A created',
    confirmationNoRecallLetter: 'Decision not to recall letter created',
    taskListNoRecall: 'Create a decision not to recall letter',
    whyConsideredRecall: 'Why you considered recall',
    reasonsForNoRecall: 'Why you think {{ fullName }} should not be recalled?',
    nextAppointment: 'Next appointment for {{ fullName }}',
  },
  pageTitles: {
    responseToProbation: 'How has the person responded to probation so far?',
    licenceConditions: 'What licence conditions has the person breached?',
    alternativesToRecallTried: 'What alternatives to recall have been tried already?',
    stopThink: 'Stop and think',
    isIndeterminateSentence: 'Is the person on an indeterminate sentence?',
    isExtendedSentence: 'Is the person on an extended sentence?',
    indeterminateSentenceType: 'What type of sentence is the person on?',
    indeterminateOrExtendedSentenceDetails: 'Indeterminate and extended sentences',
    recallType: 'What do you recommend?',
    sensitiveInformation: 'Sensitive information',
    emergencyRecall: 'Is this an emergency recall?',
    custodyStatus: 'Is the person in custody now?',
    vulnerabilities: 'Consider vulnerability and additional needs. Which of these would recall affect?',
    taskList: 'Create a Part A form',
    addressDetails: 'Address details',
    fixedTermLicenceConditions: 'Fixed term recall',
    integratedOffenderManagement: 'Is the person under Integrated Offender Management (IOM)?',
    localPoliceContactDetails: 'Local police contact details',
    victimContactScheme: 'Are there any victims in the victim contact scheme?',
    victimLiaisonOfficer: 'Victim Liaison Officer (VLO)',
    whatLedToRecall: 'What has led to this recall?',
    arrestIssues: 'Is there anything the police should know before they arrest the person?',
    contraband: 'Do you think the person is using recall to bring contraband into prison?',
    confirmationPartA: 'Part A created',
    confirmationNoRecallLetter: 'Decision not to recall letter created',
    taskListNoRecall: 'Create a decision not to recall letter',
    whyConsideredRecall: 'Why you considered recall',
    reasonsForNoRecall: 'Why you think the person should not be recalled?',
    nextAppointment: 'Next appointment for the person',
  },
}
