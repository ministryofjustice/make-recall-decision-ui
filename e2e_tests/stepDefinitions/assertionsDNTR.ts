import { proxy } from '@alfonso-presa/soft-assert'
import { formatDateToDNTRLetterFormat } from '../utils'

const expectSoftly = proxy(expect)

export const letterSubject = (contents: string) => {
  expectSoftly(contents, 'Subject of the Letter\n-->').to.contain('DECISION NOT TO RECALL')
}
export const whyRecall = (contents: string, answer: string) => {
  expectSoftly(contents, 'Why you considered recall\n-->').to.contain(answer.toLowerCase())
}
export const licenceBreachDetails = (contents: string, answer: string) => {
  expectSoftly(contents, 'Explain the license breach\n-->').to.contain(answer)
}
export const noRecallReasonDetails = (contents: string, answer: string) => {
  expectSoftly(contents, 'Explain no recall reason\n-->').to.contain(answer)
}
export const progressDetails = (contents: string, answer: string) => {
  expectSoftly(contents, 'Explain progress details\n-->').to.contain(answer)
}
export const licenceBreachExplanation = (contents: string, answer: string) => {
  expectSoftly(contents, 'License Breach explanation\n-->').to.contain(answer)
}
export const futureActionDetails = (contents: string, answer: string) => {
  expectSoftly(contents, 'Future Action Details\n-->').to.contain(answer)
}
export const appointmentOptions = (contents: string, answer: string) => {
  expectSoftly(contents, 'Select the appointment option\n-->').to.contains(answer.toLowerCase())
}
export const offendersPhoneNumber = (contents: string, answer: string) => {
  expectSoftly(contents, 'Offenders contact number\n-->').to.contain(answer)
}
export const appointmentDate = (contents: string, objectDate) => {
  expectSoftly(contents, 'Offenders next appointment date\n-->').to.contain(formatDateToDNTRLetterFormat(objectDate))
}
