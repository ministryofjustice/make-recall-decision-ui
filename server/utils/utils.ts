import config from '../config'
import { Address } from '../@types/make-recall-decision-api/models/Address'
import { FormError } from '../@types'

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

export const isNumber = (val: unknown) => typeof val === 'number'

export const areStringArraysTheSame = (arr1: unknown[], arr2: unknown[]) => arr1.join('') === arr2.join('')

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

export const errorMessage = (field: FormError) => (field ? { html: field.text } : undefined)

export const getProperty = <T, U>(obj: T, accessor: string): U => {
  const listOfKeys = accessor.split('.')
  let traversed = obj
  listOfKeys.forEach(key => {
    traversed = traversed?.[key]
  })
  return traversed as unknown as U
}

export const groupListByValue = <T>({ list, groupByKey }: { list: T[]; groupByKey: string }) => {
  return list.reduce(
    (prev, current) => {
      let group = prev.items.find(item => item.groupValue === current[groupByKey])
      if (!group) {
        group = {
          groupValue: current[groupByKey],
          items: [],
        }
        prev.items.push(group)
      }
      group.items.push(current)
      return prev
    },
    { groupedByKey: groupByKey, items: [] }
  )
}

export const dedupeList = <T>(list: T[]) => {
  const unique = [] as T[]
  list.forEach(element => {
    if (!unique.includes(element)) {
      unique.push(element)
    }
  })
  return unique
}
