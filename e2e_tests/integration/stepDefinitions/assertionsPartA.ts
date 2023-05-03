import { DateTime } from 'luxon'
import { proxy, flush } from '@alfonso-presa/soft-assert'
import { formatObjectDate, getTestDataPerEnvironment, isoDateToObject } from '../../utils'
import { formatIsoDateShort } from '../../../cypress_shared/utils'

const expectSoftly = proxy(expect)

const apiDataForCrn = getTestDataPerEnvironment()

export const q1EmergencyRecall = (contents: string, answer: string) =>
  expectSoftly(contents, 'Emergency Recall\n-->').to.contain(`until PPCS has issued the revocation order.  ${answer}`)

export const q2IndeterminateSentenceType = (contents: string, answer: string) =>
  expectSoftly(contents, 'Indeterminate Sentence Type\n-->').to.contain(
    `Is the offender serving a life or IPP/DPP sentence? ${answer}`
  )

export const q3ExtendedSentence = (contents: string, answer: string) =>
  expectSoftly(contents, 'Extended Sentence\n-->').to.contain(
    `Is the offender serving one of the following:  ${answer}`
  )

export const q4OffenderDetails = function (contents: string, context: Record<string, string>) {
  expectSoftly(contents, 'Offender: Full Name\n-->').to.contain(`Full name: ${context.fullName}`)
  expectSoftly(contents, 'Offender: Gender\n-->').to.contain(`Gender: ${context.gender}`)
  expectSoftly(contents, 'Offender: Date of birth\n-->').to.contain(
    `Offender: Date of birth: ${formatIsoDateShort(context.dateOfBirth)}`
  )
  expectSoftly(contents, 'Offender: Ethnicity\n-->').to.match(apiDataForCrn.ethnicity as RegExp)
  expectSoftly(contents, 'Offender: CRO\n-->').to.match(apiDataForCrn.cro as RegExp)
  expectSoftly(contents, 'Offender: PNC\n-->').to.match(apiDataForCrn.pnc as RegExp)
  expectSoftly(contents, 'Offender: Prison Number\n-->').to.match(apiDataForCrn.prisonNo as RegExp)
  expectSoftly(contents, 'Offender: Noms\n-->').to.match(apiDataForCrn.noms as RegExp)
  const lastReleaseDateFormatted = formatObjectDate(isoDateToObject(context.lastReleaseDate))
  expectSoftly(contents, 'Offender: Last Release Details\n-->').to.contain(`Last release: ${lastReleaseDateFormatted}`)
  expectSoftly(contents, 'Offender: Previous Release\n-->').to.contain(
    `Previous releases: ${apiDataForCrn.previousReleaseDates[0].shortFormat}, ${apiDataForCrn.previousReleaseDates[1].shortFormat}`
  )
  const lastRecallDateFormatted = context.lastRecallDate
    ? `${formatObjectDate(isoDateToObject(context.lastRecallDate))}, `
    : ''
  expectSoftly(contents, 'Offender: Dates of previous recalls\n-->').to.contain(
    `Dates of previous recalls on this sentence: ${lastRecallDateFormatted}${apiDataForCrn.previousRecallDates[0].shortFormat}, ${apiDataForCrn.previousRecallDates[1].shortFormat}`
  )
}

export const q5SentenceDetails = function (contents: string, context: Record<string, string>) {
  expectSoftly(contents, 'Sentence Details: Index offence\n-->').to.contain(
    `Index offence of current sentence which has led to the offender’s recall: ${context.indexOffenceDescription}`
  )
  expectSoftly(contents, 'Sentence Details: Dates of Original Offence\n-->').to.match(
    apiDataForCrn.dateOfOriginalOffence as RegExp
  )
  expectSoftly(contents, 'Sentence Details: Dates\n-->').to.match(apiDataForCrn.dateOfSentence as RegExp)
  expectSoftly(contents, 'Sentence Details: Length\n-->').to.match(apiDataForCrn.lengthOfSentence as RegExp)
  expectSoftly(contents, 'Sentence Details: Licence Expiry Date\n-->').to.match(
    apiDataForCrn.licenceExpiryDate as RegExp
  )
  expectSoftly(contents, 'Sentence Details: Sentence Expiry Date\n-->').to.match(
    apiDataForCrn.sentenceExpiryDate as RegExp
  )
  expectSoftly(contents, 'Sentence Details: Custodial Term\n-->').to.match(apiDataForCrn.custodialTerm as RegExp)
  expectSoftly(contents, 'Sentence Details: Extended Term\n-->').to.match(apiDataForCrn.extendedTerm as RegExp)
}

export const q6CustodyStatus = (contents: string, answer: string) =>
  expectSoftly(contents, 'Custody Status\n-->').to.contain(
    `Is the offender currently in police custody or prison custody? ${answer}`
  )

export const q7Addresses = (contents: string, answer: string) =>
  expectSoftly(contents, 'Police Custody Address\n-->').to.contain(
    `If the offender is in police custody, state where: ${answer}`
  )

export const q8ArrestIssues = (contents: string, answer: string, details: string) => {
  expectSoftly(contents, 'Arrests Police should be aware of\n-->').to.contain(
    `Are there any arrest issues of which police should be aware?  ${answer}`
  )
  expectSoftly(contents, 'Additional arrests information\n-->').to.contain(
    `If yes, provide details below, including information about any children or vulnerable adults linked to any of the above addresses: ${details}`
  )
}

export const q12MappaDetails = (contents: string) => {
  expectSoftly(contents, 'MAPPA Category\n-->').to.match(apiDataForCrn.mappaCategory as RegExp)
  expectSoftly(contents, 'MAPPA Level\n-->').to.match(apiDataForCrn.mappaLevel as RegExp)
}

export const q16IndexOffenceDetails = (contents: string) => {
  expectSoftly(contents, 'Offence Analysis\n-->').to.contain(apiDataForCrn.offenceAnalysis)
}

export const q15RoshLevels = (contents: string) => {
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

export const q22RecallType = (contents: string, answer: string, details: string) => {
  expectSoftly(contents, 'Recall Type\n-->').to.contain(
    `Select the proposed recall type, having considered the information above: ${answer}`
  )
  expectSoftly(contents, 'Recall Type Reason\n-->').to.contain(
    `Explain your reasons for the above recall type recommendation: ${details}`
  )
}

export const q25ProbationDetails = (contents: string) => {
  expectSoftly(contents, 'Probation Officer: Name\n-->').to.match(apiDataForCrn.nameOfPersonCompletingForm as RegExp)
  expectSoftly(contents, 'Probation Officer: Address\n-->').to.match(
    apiDataForCrn.emailAddressOfPersonCompletingForm as RegExp
  )
  expectSoftly(contents, 'Probation Officer: Region\n-->').to.match(apiDataForCrn.region as RegExp)
  expectSoftly(contents, 'Probation Officer: LDU\n-->').to.match(apiDataForCrn.ldu as RegExp)
  expectSoftly(contents, 'Date of Decision\n-->').to.contain(
    `${apiDataForCrn.dateOfDecision} ${DateTime.now().toFormat('dd/MM/y')}`
  )
  expectSoftly(contents, 'Time of Decision\n-->').to.match(apiDataForCrn.timeOfDecision as RegExp)
}

export const assertAllPartA = () => flush()
