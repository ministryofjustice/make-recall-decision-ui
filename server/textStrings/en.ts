export const strings: Record<string, Record<string, string>> = {
  errors: {
    noSpoRecallTypeSelected: 'Select whether you have decided to recall or made a decision not to recall',
    missingSpoRecallRationale: 'You must explain your decision',
    missingRationaleCheck: 'Choose an option',
    missingCustodyType: 'Select the custody type',
    missingSpoNoRecallRationale: 'You must explain your decision',
    missingLastName: 'Enter a last name',
    missingFirstName: 'Enter a first name',
    missingCrn: 'Enter a Case Reference Number (CRN)',
    invalidCrnFormat: 'Enter a Case Reference Number (CRN) in the correct format, for example X123456',
    saveChanges: 'An error occurred saving your changes',
    noIndexOffenceSelected: 'You must select an index offence',
    noRecallTypeSelected: 'You must select a recommendation',
    noRecallTypeExtendedSelected: 'Select whether you recommend a recall or not',
    noRecallTypeIndeterminateSelected: 'Select whether you recommend a recall or not',
    missingRecallTypeDetail: 'You must explain why you recommend this recall type',
    missingCustodyPoliceAddressDetail: 'Enter the custody address',
    missingOffenceAnalysis: 'Enter the offence analysis',
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
    missingTriggerLeadingToRecall: 'You must explain what has made you think about recalling {{ fullName }}',
    missingResponseToProbation: 'You must explain how {{ fullName }} has responded to probation',
    missingWhatLedToRecall: 'Enter details of what has led to this recall',
    noArrestIssuesSelected: "Select whether there's anything the police should know",
    missingArrestIssuesDetail: 'You must enter details of the arrest issues',
    noFixedTermLicenceConditionsSelected: 'Select whether there are additional licence conditions',
    missingFixedTermLicenceConditionsDetail: 'Enter additional licence conditions',
    noContrabandSelected: 'Select whether you think {{ fullName }} is using recall to bring contraband into prison',
    noHasBeenReleasedPreviouslySelected: 'Select whether {{ fullName }} has been released previously',
    invalidLastReleaseDate: 'Provide a valid last release date',
    invalidLastReleasingPrisonOrCustodialEstablishment: 'Provide a valid last releasing prison',
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
    noRecallLicenceBreachDetails: 'You must tell {{ fullName }} why the licence breach is a problem',
    noRecallRationale: 'You must tell {{ fullName }} why they are not being recalled',
    noRecallPopProgressMade: 'You must remind {{ fullName }} about their progress',
    noRecallFutureExpectations: "You must tell {{ fullName }} what you've agreed for the future",
    noAppointmentTypeSelected: 'You must select how the appointment will happen',
    missingProbationPhoneNumber: 'You must give a telephone number for probation',
    noAddressConfirmationSelected: 'Select whether this is where the police can find {{ fullName }}',
    missingLocationDetail: 'You must enter the correct location',
    missingRecallConsideredDetail: "Enter details about why you're considering a recall",
    noManagerRecallTypeSelected: 'Select whether you recommend a recall or not',
    missingManagerRecallTypeDetail: 'You must explain your decision',
    missingRosh: 'Select a RoSH level for the risk to',
    noDeletePreviousReleaseIndex: 'Select a previous release to delete',
    noDeletePreviousRecallIndex: 'Select a previous recall to delete',
    missingManagerCountersignatureExposition: 'You must add a comment to confirm your countersignature',
    missingWhoCompletedPartAName: 'Enter the name of the person who completed the Part A',
    missingWhoCompletedPartAEmail: 'Enter the email of the person who completed the Part A',
    invalidWhoCompletedPartAEmail: 'Enter an email address in the correct format, like name@example.com',
    missingIsPersonProbationPractitionerForOffender:
      'Select whether this person is the probation practitioner for {{ fullName }}',
    missingPractitionerForPartAName: 'Enter the name of the probation practitioner for {{ fullName }}',
    missingPractitionerForPartAEmail: 'Enter the email of the probation practitioner for {{ fullName }}',
    invalidPractitionerForPartAEmail: 'Enter an email address in the correct format, like name@example.com',
    invalidRecipientEmail: 'Enter an email address in a correct format, like name@example.com',
    missingRecipientEmail: 'Enter an email address',
    missingPPCSEmail: 'Enter an email address',
    invalidPPCSEmail: 'Enter an email address in the correct format, like name@example.com',
    noReleaseUnderECSLSelected: 'Select whether {{ fullName }} has been released on an ECSL',
  },
  errorCodesFromApi: {
    DELIUS_CONTACT_CREATION_FAILED: 'An error occurred creating a contact in NDelius',
    RECOMMENDATION_UPDATE_FAILED: 'An error occurred saving your changes to your recommendation',
  },
  notifications: {
    oasysNotFoundLatestComplete:
      'This information cannot be retrieved from OASys. Double-check as it may be out of date.',
    oasysVulnerabilityError: 'Vulnerability information cannot be retrieved from OASys.',
    oasysMissingRosh: 'The latest complete OASys assessment does not have full RoSH information.',
    oasysApiError: 'This information cannot be retrieved from OASys.',
  },
  confirmations: {
    previousReleaseDeleted: 'The previous release has been deleted',
    previousRecallDeleted: 'The previous recall has been deleted',
  },
  pageHeadings: {
    rationaleCheck: 'You must record your rationale',
    lineManagerCountersignature: 'Line manager countersignature',
    seniorManagerCountersignature: 'Senior manager countersignature',
    countersigningTelephone: 'Enter your telephone number',
    spoRecallRationale: 'Explain the decision',
    spoRecallRationaleRecallDecided: 'Explain the decision to recall {{ fullName }}',
    spoRationaleConfirmation: 'Rationale Confirmation',
    spoWhyNoRecall: 'Why do you think {{ fullName }} should not be recalled?',
    spoSeniorManagementEndorsement: 'Senior manager endorsement',
    spoRecordDecision: 'Record the decision in NDelius',
    reviewPractitionersConcerns: "Review practitioner's concerns",
    spoTaskListConsiderRecall: 'Consider a recall',
    taskListConsiderRecall: 'Consider a recall',
    shareCaseWithManager: 'Share this case with your manager',
    shareCaseWithAdmin: 'Share with a case admin',
    requestSpoCountersign: 'Request countersignature',
    requestAcoCountersign: 'Request countersignature',
    discussWithManager: 'Discuss with your manager',
    triggerLeadingToRecall: 'What has made you think about recalling {{ fullName }}?',
    managerRecordDecision: 'Record your decision',
    managerRecordDecisionDelius: 'Record your decision in NDelius',
    managerViewDecision: 'Your decision',
    responseToProbation: 'How has {{ fullName }} responded to probation so far?',
    licenceConditions: 'What licence conditions has {{ fullName }} breached?',
    alternativesToRecallTried: 'What alternatives to recall have been tried already?',
    managerReview: 'Stop and think',
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
    whoCompletedPartA: 'Who completed this Part A?',
    practitionerForPartA: 'Practitioner for {{ fullName }}?',
    revocationOrderRecipients: 'Where should the revocation order be sent?',
    ppcsQueryEmails: 'Where should the PPCS respond with questions?',
    revocationContact: 'Where should the revocation order be sent?',
    victimContactScheme: 'Are there any victims in the victim contact scheme?',
    victimLiaisonOfficer: 'Victim Liaison Officer (VLO)',
    whatLedToRecall: 'What has led to this recall?',
    personalDetails: 'Personal details',
    offenceDetails: 'Offence details',
    offenceAnalysis: 'Offence analysis',
    addressDetails: 'Address details',
    mappa: 'MAPPA for {{ fullName }}',
    rosh: 'Indicative risk assessment pending OASys review',
    requestLineManagerCounterSignature: "Request line manager's countersignature",
    requestSeniorManagerCounterSignature: "Request senior manager's countersignature",
    lineManagerCounterSignature: 'Line manager countersignature',
    seniorManagerCounterSignature: 'Senior manager countersignature',
    previousReleases: 'Previous releases',
    previousRecalls: 'Previous recalls',
    addPreviousRelease: 'Add previous release',
    addPreviousRecall: 'Add previous recall',
    arrestIssues: 'Is there anything the police should know before they arrest {{ fullName }}?',
    contraband: 'Do you think {{ fullName }} is using recall to bring contraband into prison?',
    confirmationPartA: 'Part A created',
    confirmationNoRecallLetter: 'Decision not to recall letter created',
    taskListNoRecall: 'Create a decision not to recall letter',
    whyConsideredRecall: 'Why you considered recall',
    reasonsForNoRecall: 'Why do you think {{ fullName }} should not be recalled?',
    nextAppointment: 'Next appointment for {{ fullName }}',
    previewNoRecallLetter: 'Preview the decision not to recall letter',
    countersignConfirmation: 'Part A countersigned',
    previewPartA: 'Preview Part A',
    alreadyExisting: 'There is already a recommendation for {{ fullName }}',
    searchPpud: 'Use these details to search PPUD',
    searchPpudResults: 'PPUD record found',
    checkBookingDetails: 'Check booking details for {{ fullName }}',
    selectIndexOffence: 'Select the index offence for {{ fullName }}',
    indexOffenceSelected: 'Index offence selected for {{ fullName }}',
    bookedToPpud: 'Booked onto PPUD',
    editCustodyType: 'Edit custody type',
  },
}
