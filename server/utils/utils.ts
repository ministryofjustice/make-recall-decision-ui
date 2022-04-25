import config from '../config'
import { Address } from '../@types/make-recall-decision-api/models/Address'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export default convertToTitleCase

export const makePageTitle = (pageHeading: string, hasErrors: boolean) =>
  `${hasErrors ? 'Error: ' : ''}${pageHeading} - ${config.applicationName}`

export const isDefined = (val: unknown) => typeof val !== 'undefined'

export const isString = (val: unknown) => typeof val === 'string'

export const formatSingleLineAddress = (address: Address) => {
  const parts = ['line1', 'line2', 'town', 'postcode'].map(key => address[key]).filter(Boolean)
  return listToString(parts, '')
}

export const listToString = (list: string[], conjunction?: string) => {
  if (list.length === 1) {
    return list[0]
  }
  const copy = [...list]
  if (isDefined(conjunction)) {
    const lastItem = copy.pop()
    const conjunctionWithSpace = conjunction === '' ? conjunction : `${conjunction} `
    return `${copy.join(', ')} ${conjunctionWithSpace}${lastItem}`
  }
  return copy.join(', ')
}
