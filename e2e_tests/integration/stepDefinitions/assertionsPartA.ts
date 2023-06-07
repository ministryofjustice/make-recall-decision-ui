import { DateTime } from 'luxon'
import { proxy, flush } from '@alfonso-presa/soft-assert'
import { changeDateFromLongFormatToShort, getTestDataPerEnvironment } from '../../utils'

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
  expectSoftly(contents, 'Emergency Recall\n-->').to.contain(`until PPCS has issued the revocation order.  ${answer}`)
}

export const q2IndeterminateSentenceType = (contents: string, answer: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[2]), contents.indexOf(partASections[3]))
  expectSoftly(contents, 'Indeterminate Sentence Type\n-->').to.contain(
    `Is the offender serving a life or IPP/DPP sentence? ${answer}`
  )
}

export const q3ExtendedSentence = (contents: string, answer: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[3]), contents.indexOf(partASections[4]))
  expectSoftly(contents, 'Extended Sentence\n-->').to.contain(
    `Is the offender serving one of the following:  ${answer}`
  )
}

export const q4OffenderDetails = function (contents: string, context: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[4]), contents.indexOf(partASections[5]))
  expectSoftly(contents, 'Offender: Full Name\n-->').to.contain(`Full name: ${context.fullName}`)
  expectSoftly(contents, 'Offender: Gender\n-->').to.contain(`Gender: ${context.gender}`)
  expectSoftly(contents, 'Offender: Date of birth\n-->').to.contain(
    `Date of birth: ${changeDateFromLongFormatToShort(context.dateOfBirth)}`
  )
  expectSoftly(contents, 'Offender: Ethnicity\n-->').to.match(
    context.ethnicity ? (new RegExp(context.ethnicity) as RegExp) : (apiDataForCrn.ethnicity as RegExp)
  )
  expectSoftly(contents, 'Offender: CRO\n-->').to.match(
    context.cro ? (new RegExp(context.cro) as RegExp) : (apiDataForCrn.cro as RegExp)
  )
  expectSoftly(contents, 'Offender: PNC\n-->').to.match(
    context.pnc ? (new RegExp(context.pnc) as RegExp) : (apiDataForCrn.pnc as RegExp)
  )
  expectSoftly(contents, 'Offender: Prison Number\n-->').to.match(
    context.prisonNo ? (new RegExp(context.prisonNo) as RegExp) : (apiDataForCrn.prisonNo as RegExp)
  )
  expectSoftly(contents, 'Offender: Noms\n-->').to.match(
    context.noms ? new RegExp(`PNOMIS No: ${context.noms}`) : (apiDataForCrn.noms as RegExp)
  )
  expectSoftly(contents, 'Offender: Last Release Details\n-->').to.contain(
    `Last release: ${context.lastReleaseDate ? changeDateFromLongFormatToShort(context.lastReleaseDate) : ''}`
  )
  expectSoftly(contents, 'Offender: Previous Releases\n-->').to.contain(
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
  expectSoftly(contents, 'Offender: Dates of previous recalls\n-->').to.contain(
    context.previousRecallDates
      ? `Dates of previous recalls on this sentence: ${context.previousRecallDates
          .split(',')
          .map(previousRecallDate => changeDateFromLongFormatToShort(previousRecallDate.trim()))
          .join(', ')}`
      : `Dates of previous recalls on this sentence: ${lastRecallDateFormatted}${apiDataForCrn.previousRecallDates[0].shortFormat}, ${apiDataForCrn.previousRecallDates[1].shortFormat}`
  )
  expectSoftly(contents, '').to.contain(
    `Releasing prison/Custodial establishment: ${context.releasingPrison ? context.releasingPrison : ''}`
  )
}

export const q5SentenceDetails = function (contents: string, context: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[5]), contents.indexOf(partASections[6]))
  expectSoftly(contents, 'Sentence Details: Index offence\n-->').to.contain(
    `Index offence of current sentence which has led to the offender’s recall: ${context.indexOffenceDescription}`
  )
  expectSoftly(contents, 'Sentence Details: Dates of Original Offence\n-->').to.match(
    context.dateOfOriginalOffence
      ? (new RegExp(
          `Date of original offence: \\t${DateTime.fromFormat(context.dateOfOriginalOffence, 'dd MMMM yyyy').toFormat(
            'dd/MM/yyyy'
          )}`
        ) as RegExp)
      : (apiDataForCrn.dateOfOriginalOffence as RegExp)
  )
  expectSoftly(contents, 'Sentence Details: Dates\n-->').to.match(
    context.dateOfSentence
      ? (new RegExp(
          `Date of sentence: \\t${DateTime.fromFormat(context.dateOfSentence, 'dd MMMM yyyy').toFormat('dd/MM/yyyy')}`
        ) as RegExp)
      : (apiDataForCrn.dateOfSentence as RegExp)
  )
  expectSoftly(contents, 'Sentence Details: Length\n-->').to.match(
    context.lengthOfSentence
      ? (new RegExp(`Length of sentence: \\t${context.lengthOfSentence}`) as RegExp)
      : (apiDataForCrn.lengthOfSentence as RegExp)
  )
  expectSoftly(contents, 'Sentence Details: Licence Expiry Date\n-->').to.match(
    context.licenceExpiryDate
      ? (new RegExp(
          `Licence expiry date: \\t${DateTime.fromFormat(context.licenceExpiryDate, 'dd MMMM yyyy').toFormat(
            'dd/MM/yyyy'
          )}`
        ) as RegExp)
      : (apiDataForCrn.licenceExpiryDate as RegExp)
  )
  expectSoftly(contents, 'Sentence Details: Sentence Expiry Date\n-->').to.match(
    context.sentenceExpiryDate
      ? (new RegExp(
          `Sentence expiry date: \\t${DateTime.fromFormat(context.sentenceExpiryDate, 'dd MMMM yyyy').toFormat(
            'dd/MM/yyyy'
          )}`
        ) as RegExp)
      : (apiDataForCrn.sentenceExpiryDate as RegExp)
  )
  expectSoftly(contents, 'Sentence Details: Custodial Term\n-->').to.match(
    context.custodialTerm
      ? (new RegExp(`Custodial term: \\t${context.custodialTerm}`) as RegExp)
      : (apiDataForCrn.custodialTerm as RegExp)
  )
  expectSoftly(contents, 'Sentence Details: Extended Term\n-->').to.match(
    context.extendedTerm
      ? (new RegExp(`Extended term:\\t${context.extendedTerm}`) as RegExp)
      : (apiDataForCrn.extendedTerm as RegExp)
  )
}

export const q6CustodyStatus = (contents: string, answer: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[6]), contents.indexOf(partASections[7]))
  expectSoftly(contents, 'Custody Status\n-->').to.contain(
    `Is the offender currently in police custody or prison custody? ${answer}`
  )
}

export const q7Addresses = (contents: string, answer = '') => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[7]), contents.indexOf(partASections[8]))
  expectSoftly(contents, 'Police Custody Address\n-->').to.contain(
    `If the offender is in police custody, state where: ${answer}`
  )
}

export const q8ArrestIssues = (contents: string, answer = '', details = '') => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[8]), contents.indexOf(partASections[9]))
  expectSoftly(contents, 'Arrests Police should be aware of\n-->').to.contain(
    `Are there any arrest issues of which police should be aware?  ${answer}`
  )
  expectSoftly(contents, 'Additional arrests information\n-->').to.contain(
    `If yes, provide details below, including information about any children or vulnerable adults linked to any of the above addresses: ${details}`
  )
}

export const q9LocalPoliceDetails = (contents: string, details: Record<string, string>) => {
  if (details) {
    // eslint-disable-next-line no-param-reassign
    contents = contents.substring(contents.indexOf(partASections[9]), contents.indexOf(partASections[10]))
    expectSoftly(contents, 'Local Police contact name\n-->').to.contain(
      `Police single point of contact name: ${details.contact}`
    )
    expectSoftly(contents, 'Local Police contact Number\n-->').to.contain(
      `Current contact telephone number: ${details.phoneNumber}`
    )
    expectSoftly(contents, 'Local Police Email\n-->').to.contain(`Email address: ${details.email}`)
  }
}

export const q12MappaDetails = (contents: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[12]), contents.indexOf(partASections[13]))
  expectSoftly(contents, 'MAPPA Category\n-->').to.match(apiDataForCrn.mappaCategory as RegExp)
  expectSoftly(contents, 'MAPPA Level\n-->').to.match(apiDataForCrn.mappaLevel as RegExp)
}

export const q15RoshLevels = (contents: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[15]), contents.indexOf(partASections[16]))
  expectSoftly(contents, 'ROSH Level: Risk to public\n-->').to.contain(
    `Public: ${apiDataForCrn.currentRoshForPartA.riskToPublic}`
  )
  expectSoftly(contents, 'ROSH Level: Risk to Known Adult\n-->').to.contain(
    `Known Adult: ${apiDataForCrn.currentRoshForPartA.riskToKnownAdult}`
  )
  expectSoftly(contents, 'ROSH Level:Risk to Known Children\n-->').to.contain(
    `Children: ${apiDataForCrn.currentRoshForPartA.riskToChildren}`
  )
  expectSoftly(contents, 'ROSH Level: Prisoners value\n-->').to.contain('Prisoners: N/A')
  expectSoftly(contents, 'ROSH Level: Risk to Staff\n-->').to.contain('Staff: Very High') // case doesn't match with value in apiDataForCrn.currentRoshForPartA.riskToPublic
}

export const q16IndexOffenceDetails = (contents: string, answer: string = apiDataForCrn.offenceAnalysis) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[16]), contents.indexOf(partASections[17]))
  expectSoftly(contents, 'Offence Analysis\n-->').to.contain(answer)
}

export const q22RecallType = (contents: string, answer: string, details: string) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[22]), contents.indexOf(partASections[23]))
  expectSoftly(contents, 'Recall Type\n-->').to.contain(
    `Select the proposed recall type, having considered the information above: ${answer}`
  )
  expectSoftly(contents, 'Recall Type Reason\n-->').to.contain(
    `Explain your reasons for the above recall type recommendation: ${details}`
  )
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const q25ProbationDetails = (contents: string, details: Record<string, any> = apiDataForCrn) => {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[25]), contents.indexOf(partASections[26]))
  expectSoftly(contents, 'Probation Officer: Name\n-->').to.match(details.nameOfPersonCompletingForm as RegExp)
  expectSoftly(contents, 'Probation Officer: Address\n-->').to.match(
    details.emailAddressOfPersonCompletingForm as RegExp
  )
  expectSoftly(contents, 'Probation Officer: Region\n-->').to.match(details.region as RegExp)
  expectSoftly(contents, 'Probation Officer: LDU\n-->').to.match(details.ldu as RegExp)
  expectSoftly(contents, 'Date of Decision\n-->').to.contain(
    `${details.dateOfDecision} ${DateTime.now().toFormat('dd/MM/y')}`
  )
  expectSoftly(contents, 'Time of Decision\n-->').to.match(details.timeOfDecision as RegExp)
}

export const q27SPOEndorsement = function (contents: string, details: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[27]), contents.indexOf(partASections[28]))
  expectSoftly(contents, 'Q27 - SPO Name').to.contain(
    `Name of person completing this form: ${this.SPO ? this.SPO.name : ''}`
  )
  expectSoftly(contents, 'Q27 - SPO Telephone').to.contain(
    `Telephone Number: ${details.telephone ? details.telephone : ''}`
  )
  expectSoftly(contents, 'Q27 - SPO Reason').to.contain(`Please provide additional information:${details.reason}`)
}
export const q28ACOAuthorisation = function (contents: string, details: Record<string, string>) {
  // eslint-disable-next-line no-param-reassign
  contents = contents.substring(contents.indexOf(partASections[28]), contents.indexOf(partASections[29]))
  expectSoftly(contents, 'Q28 - ACO Name').to.contain(
    `Name of person completing this form: ${this.ACO ? this.ACO.name : ''}`
  )
  expectSoftly(contents, 'Q28 - ACO Telephone').to.contain(
    `Telephone Number: ${details.telephone ? details.telephone : ''}`
  )
  expectSoftly(contents, 'Q28 - ACO Reason').to.contain(
    `This means you are endorsing both the recall and the quality and content of the recall report.${details.reason}`
  )
}

export const assertAllPartA = () => flush()
