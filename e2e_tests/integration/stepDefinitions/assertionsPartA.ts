import { DateTime } from 'luxon'
import { formatObjectDate, getTestDataPerEnvironment, isoDateToObject } from '../../utils'
import { formatIsoDateShort } from '../../../cypress_shared/utils'
import { ObjectMap } from '../../../server/@types'

const apiDataForCrn = getTestDataPerEnvironment()

export const q1EmergencyRecall = (contents: string, answer: string) =>
  expect(contents).to.contain(`until PPCS has issued the revocation order.  ${answer}`)

export const q2IndeterminateSentenceType = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender serving a life or IPP/DPP sentence? ${answer}`)

export const q3ExtendedSentence = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender serving one of the following:  ${answer}`)

export const q4OffenderDetails = (contents: string) => {
  cy.get<string>('@fullName').then(fullName => expect(contents).to.contain(`Full name: ${fullName}`))
  cy.get<string>('@gender').then(gender => expect(contents).to.contain(`Gender: ${gender}`))
  cy.get<string>('@dateOfBirth').then(dateOfBirth =>
    expect(contents).to.contain(`Date of birth: ${formatIsoDateShort(dateOfBirth)}`)
  )
  expect(contents).to.match(apiDataForCrn.ethnicity as RegExp)
  expect(contents).to.match(apiDataForCrn.cro as RegExp)
  expect(contents).to.match(apiDataForCrn.pnc as RegExp)
  expect(contents).to.match(apiDataForCrn.prisonNo as RegExp)
  expect(contents).to.match(apiDataForCrn.noms as RegExp)
  cy.get<string>('@lastReleaseDate').then(lastReleaseDate => {
    const lastReleaseDateFormatted = formatObjectDate(isoDateToObject(lastReleaseDate))
    const previousReleaseDateFormatted = formatObjectDate(apiDataForCrn.previousReleaseDate)
    expect(contents).to.contain(
      `Date of last release and previous release: ${lastReleaseDateFormatted}, ${previousReleaseDateFormatted}`
    )
  })
}

export const q5SentenceDetails = (contents: string) => {
  cy.get('@indexOffenceDescription').then(indexOffenceDescription => {
    expect(contents).to.contain(
      `Index offence of current sentence which has led to the offender’s recall: ${indexOffenceDescription}`
    )
  })
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
