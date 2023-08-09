import { DateTime } from 'luxon'
import { proxy, flush } from '@alfonso-presa/soft-assert'
import {
  changeDateFromLongFormatToShort,
  formatObjectDateToLongFormat,
  getTestDataPerEnvironment,
  formattedTimeIn24HrFormat,
} from '../utils'
import {
  Alternatives,
  IndeterminateOrExtendedSentenceDetailType,
  LicenceConditions,
  NonIndeterminateRecallType,
  REGEXP_SPECIAL_CHAR,
  ROSHLevels,
  YesNoNAType,
  YesNoType,
} from '../support/enums'

const expectSoftly = proxy(expect)

const apiDataForCrn = getTestDataPerEnvironment()

const partASections = {
  1: '1. Is this an Emergency recall?',
  2: '2. Is the offender serving a life or IPP/DPP sentence?',
  3: '3. Is the offender serving one of the following',
  4: '4. Offender/Young Offender Details',
  5: '5. Sentence details',
  6: '6. Is the offender currently in police custody or prison custody',
  7: '7. Last recorded address where s/he should be residing',
  8: '8. Are there any arrest issues of which police should be aware',
  9: '9. Local police details and the OM’s local police contact',
  10: '10. Are there any vulnerability issues',
  11: '11. Do you have any suspicions that the offender is using recall to bring contraband into the prison estate',
  12: '12. Current MAPPA Management',
  13: '13. Registered PPO/IOM',
  14: '14. VLO Contact',
  15: '15. Current Risk of Serious Harm Assessment at time of this recall',
  16: '16. Provide details of the index offence(s)',
  17: '17. Tick all standard licence conditions which have been breached',
  18: '18. If any additional licence condition(s) has been breached',
  19: '19. Detail the circumstances and behaviours leading to the recall',
  20: '20. Provide details of how the offender has responded to supervision to date',
  21: '21. What alternatives to recall have been taken to try to secure compliance',
  22: '22. Select the proposed recall type, having considered the information above',
  23: '23. If you are proposing a Fixed Term Recall',
  24: '24. When recalling an ISP or ESP',
  25: '25. Probation Details – PS/YOT community offender manager',
  26: '26. If different from above, details of the current supervising PS/YOT community offender manager',
  27: '27. Endorsement of Recall Report and Risk Assessment by PS/YOT Line Manager',
  28: '28. Authorisation and comments by senior manager who is equivalent to the former ACO grade/YOT Manager or equivalent',
  29: '29. Attachments',
}

export const q1EmergencyRecall = (contents: string, answer: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[1]), contents.indexOf(partASections[2]))
  expectSoftly(contents, 'Emergency Recall').to.contain(`until PPCS has issued the revocation order.  ${answer}`)
}

export const q2IndeterminateSentenceType = (contents: string, answer: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[2]), contents.indexOf(partASections[3]))
  expectSoftly(contents, 'Indeterminate Sentence Type').to.contain(
    `Is the offender serving a life or IPP/DPP sentence? ${answer}`
  )
}

export const q3ExtendedSentence = (contents: string, answer: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[3]), contents.indexOf(partASections[4]))
  expectSoftly(contents, 'Extended Sentence').to.contain(`Is the offender serving one of the following:  ${answer}`)
}

export const q4OffenderDetails = function (contents: string, context: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[4]), contents.indexOf(partASections[5]))
  expectSoftly(contents, 'Offender-Full Name').to.contain(`Full name: ${context.fullName}`)
  expectSoftly(contents, 'Offender-Gender').to.contain(`Gender: ${context.gender}`)
  expectSoftly(contents, 'Offender-Date of birth').to.contain(
    `Date of birth: ${changeDateFromLongFormatToShort(context.dateOfBirth)}`
  )
  expectSoftly(contents, 'Offender-Ethnicity').to.match(
    context.ethnicity
      ? new RegExp(`Ethnic category: ${context.ethnicity.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.ethnicity as RegExp)
  )
  expectSoftly(contents, 'Offender-CRO').to.match(
    context.cro || context.cro === ''
      ? new RegExp(`CRO No: ${context.cro.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.cro as RegExp)
  )
  expectSoftly(contents, 'Offender-PNC').to.match(
    context.pnc || context.pnc === ''
      ? new RegExp(`PNC No: ${context.pnc.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.pnc as RegExp)
  )
  expectSoftly(contents, 'Offender-Prison Number').to.match(
    context.prisonNo || context.prisonNo === ''
      ? new RegExp(`Prison No: ${context.prisonNo.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.prisonNo as RegExp)
  )
  expectSoftly(contents, 'Offender-Noms').to.match(
    context.noms || context.noms === ''
      ? new RegExp(`PNOMIS No: ${context.noms.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.noms as RegExp)
  )
  expectSoftly(contents, 'Offender-Last Release Details').to.contain(
    `Last release: ${context.lastReleaseDate ? changeDateFromLongFormatToShort(context.lastReleaseDate) : ''}`
  )
  expectSoftly(contents, 'Offender-Previous Releases').to.contain(
    // eslint-disable-next-line no-nested-ternary
    context.previousReleaseDates === ''
      ? 'Previous releases:'
      : context.previousReleaseDates && context.previousReleaseDates.length > 0
      ? `Previous releases: ${context.previousReleaseDates
          .split(',')
          .map(previousReleaseDate => changeDateFromLongFormatToShort(previousReleaseDate.trim()))
          .join(', ')}`
      : `Previous releases: ${apiDataForCrn.previousReleaseDates[0].shortFormat}, ${apiDataForCrn.previousReleaseDates[1].shortFormat}`
  )
  const lastRecallDateFormatted = context.lastRecallDate
    ? `${changeDateFromLongFormatToShort(context.lastRecallDate)}, `
    : ''
  expectSoftly(contents, 'Offender-Dates of previous recalls').to.contain(
    // eslint-disable-next-line no-nested-ternary
    context.previousRecallDates === ''
      ? 'Dates of previous recalls on this sentence:'
      : context.previousRecallDates && context.previousRecallDates.length > 0
      ? `Dates of previous recalls on this sentence: ${context.previousRecallDates
          .split(',')
          .map(previousRecallDate => changeDateFromLongFormatToShort(previousRecallDate.trim()))
          .join(', ')}`
      : `Dates of previous recalls on this sentence: ${lastRecallDateFormatted}${apiDataForCrn.previousRecallDates[0].shortFormat}, ${apiDataForCrn.previousRecallDates[1].shortFormat}`
  )
  expectSoftly(contents, 'Releasing prison or custodial establishment').to.contain(
    `Releasing prison/Custodial establishment: ${context.releasingPrison ? context.releasingPrison : ''}`
  )
}

export const q5SentenceDetails = function (contents: string, context: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[5]), contents.indexOf(partASections[6]))
  expectSoftly(contents, 'Sentence Details-Index offence').to.contain(
    `Index offence of current sentence which has led to the offender’s recall: ${context.indexOffenceDescription}`
  )
  expectSoftly(contents, 'Sentence Details-Dates of Original Offence').to.match(
    context.dateOfOriginalOffence
      ? new RegExp(
          `Date of original offence: \\t${changeDateFromLongFormatToShort(context.dateOfOriginalOffence).replace(
            REGEXP_SPECIAL_CHAR,
            '\\$&'
          )}`
        )
      : (apiDataForCrn.dateOfOriginalOffence as RegExp)
  )
  expectSoftly(contents, 'Sentence Details-Dates').to.match(
    context.dateOfSentence
      ? new RegExp(
          `Date of sentence: \\t${changeDateFromLongFormatToShort(context.dateOfSentence).replace(
            REGEXP_SPECIAL_CHAR,
            '\\$&'
          )}`
        )
      : (apiDataForCrn.dateOfSentence as RegExp)
  )
  expectSoftly(contents, 'Sentence Details-Length').to.match(
    context.lengthOfSentence
      ? new RegExp(`Length of sentence: \\t${context.lengthOfSentence.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.lengthOfSentence as RegExp)
  )
  expectSoftly(contents, 'Sentence Details-Licence Expiry Date').to.match(
    // eslint-disable-next-line no-nested-ternary
    context.licenceExpiryDate === ''
      ? /Licence expiry date:/
      : context.licenceExpiryDate && context.licenceExpiryDate.length > 0
      ? new RegExp(
          `Licence expiry date: \\t${changeDateFromLongFormatToShort(context.licenceExpiryDate).replace(
            REGEXP_SPECIAL_CHAR,
            '\\$&'
          )}`
        )
      : (apiDataForCrn.licenceExpiryDate as RegExp)
  )
  expectSoftly(contents, 'Sentence Details-Sentence Expiry Date').to.match(
    // eslint-disable-next-line no-nested-ternary
    context.sentenceExpiryDate === ''
      ? /Sentence expiry date:/
      : context.sentenceExpiryDate && context.sentenceExpiryDate.length > 0
      ? new RegExp(
          `Sentence expiry date: \\t${changeDateFromLongFormatToShort(context.sentenceExpiryDate).replace(
            REGEXP_SPECIAL_CHAR,
            '\\$&'
          )}`
        )
      : (apiDataForCrn.sentenceExpiryDate as RegExp)
  )
  expectSoftly(contents, 'Sentence Details-Custodial Term').to.match(
    // eslint-disable-next-line no-nested-ternary
    context.custodialTerm === ''
      ? /Custodial term:/
      : context.custodialTerm && context.custodialTerm.length > 0
      ? new RegExp(`Custodial term: \\t${context.custodialTerm.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.custodialTerm as RegExp)
  )
  expectSoftly(contents, 'Sentence Details-Extended Term').to.match(
    // eslint-disable-next-line no-nested-ternary
    context.extendedTerm === ''
      ? /Extended term:/
      : context.extendedTerm && context.extendedTerm.length > 0
      ? new RegExp(`Extended term:\\t${context.extendedTerm.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.extendedTerm as RegExp)
  )
}

export const q6CustodyStatus = (contents: string, answer: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[6]), contents.indexOf(partASections[7]))
  expectSoftly(contents, 'Custody Status').to.contain(
    `Is the offender currently in police custody or prison custody? ${answer}`
  )
}

export const q7Addresses = (contents: string, answer = '') => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[7]), contents.indexOf(partASections[8]))
  expectSoftly(contents, 'Police Custody Address').to.contain(
    `If the offender is in police custody, state where: ${answer}`
  )
}

export const q8ArrestIssues = (contents: string, answer = '', details = '') => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[8]), contents.indexOf(partASections[9]))
  expectSoftly(contents, 'Arrests Police should be aware of').to.contain(
    `Are there any arrest issues of which police should be aware?  ${answer}`
  )
  expectSoftly(contents, 'Additional arrests information').to.contain(
    `If yes, provide details below, including information about any children or vulnerable adults linked to any of the above addresses: ${details}`
  )
}

export const q9LocalPoliceDetails = (contents: string, details: Record<string, string>) => {
  if (details) {
    // eslint-disable-next-line no-param-reassign
    contents = contents.substring(contents.indexOf(partASections[9]), contents.indexOf(partASections[10]))
    expectSoftly(contents, 'Local Police-Contact name').to.contain(
      `Police single point of contact name: ${details.contact}`
    )
    expectSoftly(contents, 'Local Police-Contact Number').to.contain(
      `Current contact telephone number: ${details.phoneNumber}`
    )
    expectSoftly(contents, 'Local Police-Email').to.contain(`Email address: ${details.email}`)
  }
}

export const q10Vulnerabilities = (contents: string, details: Record<string, string>[] | string[]) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[10]), contents.indexOf(partASections[11]))
  if (details && typeof details[0] === 'string') {
    expectSoftly(contents, 'Vulnerabilities status').to.contain(
      `Are there any vulnerability issues and/or diversity needs in view of arrest and subsequent location at prison or police custody? No`
    )
    expectSoftly(contents, 'Vulnerabilities details').to.contain(`If yes, provide details: ${details[0]}`)
  } else if (details && typeof details[0] === 'object') {
    details.forEach(detail => {
      expectSoftly(contents, 'Vulnerabilities status').to.contain(
        `Are there any vulnerability issues and/or diversity needs in view of arrest and subsequent location at prison or police custody? Yes`
      )
      expectSoftly(contents, 'Vulnerabilities details').to.contain(
        `${detail.vulnerabilityName}:${detail.vulnerabilityNotes}`
      )
    })
  }
}
export const q11Contraband = (contents: string, details: Record<string, string>) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[11]), contents.indexOf(partASections[12]))
  expectSoftly(contents, 'Contraband risk').to.contain(
    `Do you have any suspicions that the offender is using recall to bring contraband into the prison estate? ${
      YesNoType[details.hasRisk]
    }`
  )
  expectSoftly(contents, 'Contraband details').to.contain(
    `If yes, provide details and contact your local police SPOC to share information or concerns: ${
      details.riskDetails ? details.riskDetails : ' '
    }`
  )
}

export const q12MappaDetails = (contents: string, details?: Record<string, string>) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[12]), contents.indexOf(partASections[13]))
  expectSoftly(contents, 'MAPPA Category').to.match(
    details
      ? new RegExp(`MAPPA Category: ${details.mappaCategory.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.mappaCategory as RegExp)
  )
  expectSoftly(contents, 'MAPPA Level').to.match(
    details
      ? new RegExp(`MAPPA Level: ${details.mappaLevel.replace(REGEXP_SPECIAL_CHAR, '\\$&')}`)
      : (apiDataForCrn.mappaLevel as RegExp)
  )
}

export const q13RegisteredPPOIOM = (contents: string, details: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[13]), contents.indexOf(partASections[14]))
  expectSoftly(contents, 'IOM state').to.contain(`Registered PPO/IOM: ${YesNoNAType[details]}`)
}

export const q14VLOContact = (contents: string, details) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[14]), contents.indexOf(partASections[15]))
  expectSoftly(contents, 'VLO status').to.contain(
    `Is there a victim(s) involved in the victim contact scheme (contact must be made with the VLO if there is victim involvement)? ${
      YesNoNAType[details.inVLOScheme]
    }`
  )
  expectSoftly(contents, 'VLO Date').to.contain(
    `Confirm the date the VLO was informed of the above: ${
      details.vloDate
        ? formatObjectDateToLongFormat({
            day: details.vloDate.getDate().toString(),
            month: (details.vloDate.getMonth() + 1).toString(),
            year: details.vloDate.getFullYear().toString(),
          })
        : ''
    }`
  )
}

export const q15RoshLevels = (contents: string, details?: Record<string, string>) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[15]), contents.indexOf(partASections[16]))
  expectSoftly(contents, 'ROSH Level-Risk to public').to.contain(
    `Public: ${
      details?.riskToPublic ? ROSHLevels[details.riskToPublic] : apiDataForCrn.currentRoshForPartA.riskToPublic
    }`
  )
  expectSoftly(contents, 'ROSH Level-Risk to Known Adult').to.contain(
    `Known Adult: ${
      details?.riskToKnownAdult
        ? ROSHLevels[details.riskToKnownAdult]
        : apiDataForCrn.currentRoshForPartA.riskToKnownAdult
    }`
  )
  expectSoftly(contents, 'ROSH Level-Risk to Known Children').to.contain(
    `Children: ${
      details?.riskToChildren ? ROSHLevels[details.riskToChildren] : apiDataForCrn.currentRoshForPartA.riskToChildren
    }`
  )
  expectSoftly(contents, 'ROSH Level-Prisoners value').to.contain(
    `Prisoners: ${details?.riskToPrisoner ? ROSHLevels[details.riskToPrisoner] : 'N/A'}`
  )
  expectSoftly(contents, 'ROSH Level-Risk to Staff').to.contain(
    `Staff: ${details?.riskToStaff ? ROSHLevels[details.riskToStaff] : 'Very High'}`
  ) // case doesn't match with value in apiDataForCrn.currentRoshForPartA.riskToPublic
}

export const q16IndexOffenceDetails = (contents: string, answer: string = apiDataForCrn.offenceAnalysis) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[16]), contents.indexOf(partASections[17]))
  expectSoftly(contents, 'Offence Analysis').to.contain(answer)
}

export const q17LicenceConditions = (contents: string, details: string[]) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[17]), contents.indexOf(partASections[18]))
  details.forEach(detail => {
    expectSoftly(contents, 'Licence Conditions').to.match(
      new RegExp(`${LicenceConditions[detail].replace(REGEXP_SPECIAL_CHAR, '\\$&')}\\s*✓`)
    )
  })
}

export const q18AdditionalConditions = (contents: string, details: string[]) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[18]), contents.indexOf(partASections[19]))
  details.forEach(detail => {
    expectSoftly(contents, 'Additional Licence Conditions').to.contain(detail)
  })
}

export const q19CircumstancesLeadingToRecall = (contents: string, details: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[19]), contents.indexOf(partASections[20]))
  expectSoftly(contents, 'Circumstance leading to recall').to.contain(details)
}

export const q20ResponseToSupervision = (contents: string, details: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[20]), contents.indexOf(partASections[21]))
  expectSoftly(contents, 'Response to Supervision').to.contain(details)
}

export const q21Alternatives = (contents: string, details: Record<string, string>[] | string[]) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[21]), contents.indexOf(partASections[22]))
  if (details && typeof details[0] === 'object') {
    details.forEach(detail => {
      expectSoftly(contents, 'Alternatives').to.contain(
        `${Alternatives[detail.alternativeName]}${detail.alternativeNotes}`
      )
    })
  } else if (details && typeof details[0] === 'string') {
    Object.keys(Alternatives).forEach(alternativeName => {
      expectSoftly(contents, 'Alternatives').to.match(
        new RegExp(`${Alternatives[alternativeName].replace(REGEXP_SPECIAL_CHAR, '\\$&')}[^\\s]`)
      )
    })
  }
}

export const q22RecallType = (contents: string, details: Record<string, string>) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[22]), contents.indexOf(partASections[23]))
  if (details.indeterminate === 'NO' && details.extended === 'NO') {
    // eslint-disable-next-line no-param-reassign
    details.type = NonIndeterminateRecallType[details.recallType]
    // eslint-disable-next-line no-param-reassign
    details.reason = details.partARecallReason
  } else if (details.indeterminate === 'NO' && details.extended === 'YES') {
    // eslint-disable-next-line no-param-reassign
    details.type = 'N/A (extended sentence recall)'
    // eslint-disable-next-line no-param-reassign
    details.reason = 'N/A (extended sentence recall)'
  } else if (details.indeterminate === 'YES') {
    // eslint-disable-next-line no-param-reassign
    details.type = 'N/A (not a determinate recall)'
    // eslint-disable-next-line no-param-reassign
    details.reason = 'N/A (not a determinate recall)'
  }
  expectSoftly(contents, 'Recall Type').to.contain(
    `Select the proposed recall type, having considered the information above: ${details.type}`
  )
  expectSoftly(contents, 'Recall Type Reason').to.contain(
    `Explain your reasons for the above recall type recommendation: ${details.reason}`
  )
}

export const q23LicenceConditionsToAdd = (contents: string, details: Record<string, string>) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[23]), contents.indexOf(partASections[24]))
  expectSoftly(contents, 'Licence Conditions to Add').to.contain(
    // eslint-disable-next-line no-nested-ternary
    details.recallType === 'STANDARD'
      ? 'N/A (standard recall)'
      : /* eslint-disable-next-line no-nested-ternary */
      details.recallType === 'FIXED_TERM' && details.fixedTermRecall === 'NO'
      ? ''
      : /* eslint-disable-next-line no-nested-ternary */
      details.indeterminate === 'YES'
      ? 'N/A (not a determinate recall)'
      : details.extended === 'YES'
      ? 'N/A (extended sentence recall)'
      : details.fixedTermRecallNotes
  )
}

export const q24ISPESP = (contents: string, details: Record<string, string>) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[24]), contents.indexOf(partASections[25]))
  if (details) {
    Object.keys(IndeterminateOrExtendedSentenceDetailType).forEach(k => {
      if (details[k]) {
        expectSoftly(contents, `${k} Yes/No`).to.contain(`${IndeterminateOrExtendedSentenceDetailType[k]} Yes`)
        expectSoftly(contents, `${k} comments`).to.contain(`Please Comment: ${details[k]}`)
      } else expectSoftly(contents, `${k} Yes/No`).to.contain(`${IndeterminateOrExtendedSentenceDetailType[k]} No`)
    })
  }
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const q25ProbationDetails = (contents: string, details: Record<string, any> = apiDataForCrn) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[25]), contents.indexOf(partASections[26]))
  expectSoftly(contents, 'Probation-Officer-Name').to.match(details.nameOfPersonCompletingForm as RegExp)
  expectSoftly(contents, 'Probation-Officer-Address').to.match(details.emailAddressOfPersonCompletingForm as RegExp)
  expectSoftly(contents, 'Probation-Officer-Region').to.match(details.region as RegExp)
  expectSoftly(contents, 'Probation-Officer-LDU').to.match(details.ldu as RegExp)
  expectSoftly(contents, 'Probation-Date of Decision').to.contain(
    `${details.dateOfDecision} ${DateTime.now().toFormat('dd/MM/y')}`
  )
  expectSoftly(contents, 'Probation-Time of Decision').to.contain(
    `${details.timeOfDecision} ${formattedTimeIn24HrFormat()}`
  )
}

export const q26OffenderManager = (contents: string, details: Record<string, string>[] | string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[26]), contents.indexOf(partASections[27]))
  cy.log(`Q26: ${JSON.stringify(details)} ${contents}`)
}

export const q27SPOEndorsement = function (contents: string, details: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[27]), contents.indexOf(partASections[28]))
  expectSoftly(contents, 'SPO Name').to.contain(`Name of person completing this form: ${this.SPO ? this.SPO.name : ''}`)
  expectSoftly(contents, 'SPO Email').to.contain(`${this.SPO ? this.SPO.email : ''}`)
  expectSoftly(contents, 'SPO Telephone').to.contain(`Telephone Number: ${details.telephone ? details.telephone : ''}`)
  expectSoftly(contents, 'SPO Reason').to.contain(`Please provide additional information:${details.reason}`)
}
export const q28ACOAuthorisation = function (contents: string, details: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[28]), contents.indexOf(partASections[29]))
  expectSoftly(contents, 'ACO Name').to.contain(`Name of person completing this form: ${this.ACO ? this.ACO.name : ''}`)
  expectSoftly(contents, 'ACO Email').to.contain(`${this.ACO ? this.ACO.email : ''}`)
  expectSoftly(contents, 'ACO Telephone').to.contain(`Telephone Number: ${details.telephone ? details.telephone : ''}`)
  expectSoftly(contents, 'ACO Reason').to.contain(
    `This means you are endorsing both the recall and the quality and content of the recall report.${details.reason}`
  )
}

export const q29Attachments = (contents: string, details: Record<string, string>[] | string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[29]))
  cy.log(`Q29: ${JSON.stringify(details)} ${contents}`)
}

export const assertAllPartA = () => flush()
