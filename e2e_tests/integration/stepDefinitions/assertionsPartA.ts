import { DateTime } from 'luxon'
import { formatObjectDate, getTestDataPerEnvironment, isoDateToObject } from '../../utils'
import { formatIsoDateShort } from '../../../cypress_shared/utils'

const apiDataForCrn = getTestDataPerEnvironment()

export const q1EmergencyRecall = (contents: string, answer: string) =>
  expect(contents).to.contain(`until PPCS has issued the revocation order.  ${answer}`)

export const q2IndeterminateSentenceType = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender serving a life or IPP/DPP sentence? ${answer}`)

export const q3ExtendedSentence = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender serving one of the following:  ${answer}`)

export const q4OffenderDetails = function (contents: string, context: Record<string, string>) {
  expect(contents).to.contain(`Full name: ${context.fullName}`)
  expect(contents).to.contain(`Gender: ${context.gender}`)
  expect(contents).to.contain(`Date of birth: ${formatIsoDateShort(context.dateOfBirth)}`)
  expect(contents).to.match(apiDataForCrn.ethnicity as RegExp)
  expect(contents).to.match(apiDataForCrn.cro as RegExp)
  expect(contents).to.match(apiDataForCrn.pnc as RegExp)
  expect(contents).to.match(apiDataForCrn.prisonNo as RegExp)
  expect(contents).to.match(apiDataForCrn.noms as RegExp)
  const lastReleaseDateFormatted = formatObjectDate(isoDateToObject(context.lastReleaseDate))
  expect(contents).to.contain(`Last release: ${lastReleaseDateFormatted}`)
  expect(contents).to.contain(
    `Previous releases: ${apiDataForCrn.previousReleaseDates[0].shortFormat}, ${apiDataForCrn.previousReleaseDates[1].shortFormat}`
  )
  const lastRecallDateFormatted = context.lastRecallDate
    ? `${formatObjectDate(isoDateToObject(context.lastRecallDate))}, `
    : ''
  expect(contents).to.contain(
    `Dates of previous recalls on this sentence: ${lastRecallDateFormatted}${apiDataForCrn.previousRecallDates[0].shortFormat}, ${apiDataForCrn.previousRecallDates[1].shortFormat}`
  )
}

export const q5SentenceDetails = function (contents: string, context: Record<string, string>) {
  expect(contents).to.contain(
    `Index offence of current sentence which has led to the offender’s recall: ${context.indexOffenceDescription}`
  )
  expect(contents).to.match(apiDataForCrn.dateOfOriginalOffence as RegExp)
  expect(contents).to.match(apiDataForCrn.dateOfSentence as RegExp)
  expect(contents).to.match(apiDataForCrn.lengthOfSentence as RegExp)
  expect(contents).to.match(apiDataForCrn.licenceExpiryDate as RegExp)
  expect(contents).to.match(apiDataForCrn.sentenceExpiryDate as RegExp)
  expect(contents).to.match(apiDataForCrn.custodialTerm as RegExp)
  expect(contents).to.match(apiDataForCrn.extendedTerm as RegExp)
}

export const q6CustodyStatus = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender currently in police custody or prison custody? ${answer}`)

export const q7Addresses = (contents: string, answer: string) =>
  expect(contents).to.contain(`If the offender is in police custody, state where: ${answer}`)

export const q8ArrestIssues = (contents: string, answer: string, details: string) => {
  expect(contents).to.contain(`Are there any arrest issues of which police should be aware?  ${answer}`)
  expect(contents).to.contain(
    `If yes, provide details below, including information about any children or vulnerable adults linked to any of the above addresses: ${details}`
  )
}

export const q12MappaDetails = (contents: string) => {
  expect(contents).to.match(apiDataForCrn.mappaCategory as RegExp)
  expect(contents).to.match(apiDataForCrn.mappaLevel as RegExp)
}

export const q16IndexOffenceDetails = (contents: string) => {
  expect(contents).to.contain(apiDataForCrn.offenceAnalysis)
}

export const q15RoshLevels = (contents: string) => {
  expect(contents).to.contain(`Public: ${apiDataForCrn.currentRoshForPartA.riskToPublic}`)
  expect(contents).to.contain(`Known Adult: ${apiDataForCrn.currentRoshForPartA.riskToKnownAdult}`)
  expect(contents).to.contain(`Children: ${apiDataForCrn.currentRoshForPartA.riskToChildren}`)
  expect(contents).to.contain('Prisoners: N/A')
  expect(contents).to.contain('Staff: Very High') // case doesn't match with value in apiDataForCrn.currentRoshForPartA.riskToPublic
}

export const q22RecallType = (contents: string, answer: string, details: string) => {
  expect(contents).to.contain(`Select the proposed recall type, having considered the information above: ${answer}`)
  expect(contents).to.contain(`Explain your reasons for the above recall type recommendation: ${details}`)
}

export const q25ProbationDetails = (contents: string) => {
  expect(contents).to.match(apiDataForCrn.nameOfPersonCompletingForm as RegExp)
  expect(contents).to.match(apiDataForCrn.emailAddressOfPersonCompletingForm as RegExp)
  expect(contents).to.match(apiDataForCrn.region as RegExp)
  expect(contents).to.match(apiDataForCrn.ldu as RegExp)
  expect(contents).to.contain(`${apiDataForCrn.dateOfDecision} ${DateTime.now().toFormat('dd/MM/y')}`)
  expect(contents).to.match(apiDataForCrn.timeOfDecision as RegExp)
}
