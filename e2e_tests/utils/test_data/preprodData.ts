export const preprodData = {
  fullName: /Full name: .*/,
  dateOfBirth: /Date of birth: \d{2}\/\d{2}\/\d{4}/,
  ethnicity: /Ethnic category: .+/,
  gender: /Gender: Male/,
  cro: /CRO No: [A-Z0-9]{9}/,
  pnc: /PNC No: [A-Z0-9/]{13}.*/,
  prisonNo: /Prison No: [A-Z0-9]{6}/,
  noms: /PNOMIS No: [A-Z0-9]{7}/,
  indexOffence: /Index offence of current sentence which has led to the offender’s recall:.*/,
  dateOfOriginalOffence: /Date of original offence: \t\d{2}\/\d{2}\/\d{4}/,
  dateOfSentence: /Date of sentence: \t\d{2}\/\d{2}\/\d{4}/,
  lengthOfSentence: /Length of sentence: \t\d{2} Months/,
  licenceExpiryDate: /Licence expiry date: \t\d{2}\/\d{2}\/\d{4}/,
  sentenceExpiryDate: /Sentence expiry date: \t\d{2}\/\d{2}\/\d{4}/,
  custodialTerm: /Custodial term:/,
  extendedTerm: /Extended term:/,
  mappaCategory: /MAPPA Category: Category \d/,
  mappaLevel: /MAPPA Level: Level \d/,
  indexOffenceDetails: /Provide details of the index offence\(s\) and write a succinct offence analysis:.*/,
  nameOfPersonCompletingForm: /Name of person completing the form: Jon Wyatt/,
  emailAddressOfPersonCompletingForm: /Email Address: .*@digital\.justice\.gov\.uk/,
  region: /Region:.*/,
  ldu: /LDU:.*/,
  dateOfDecision: 'Date of decision to request revocation:',
  timeOfDecision: /Time \(24 hour\) of decision to request information: \d{2}:\d{2}/,
}
