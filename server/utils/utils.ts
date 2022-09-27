import qs from 'qs'
import config from '../config'
import { Address } from '../@types/make-recall-decision-api/models/Address'
import { FormError, ObjectMap } from '../@types'
import { UserAccessResponse } from '../@types/make-recall-decision-api/models/UserAccessResponse'
import { AppError } from '../AppError'

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

export const makePageTitle = ({ pageHeading, hasErrors }: { pageHeading: string; hasErrors: boolean }) =>
  `${hasErrors ? 'Error: ' : ''}${pageHeading} - ${config.applicationName}`

export const isDefined = (val: unknown) => typeof val !== 'undefined'

export const isNotNull = (val: unknown) => {
  return val !== null
}

export const isNotNullOrUndefined = (val: unknown) => {
  return isNotNull(val) && isDefined(val)
}

export const isString = (val: unknown) => typeof val === 'string'

export const isNumber = (val: unknown) => typeof val === 'number'

export const areStringArraysTheSame = (arr1: unknown[], arr2: unknown[]) => arr1.join('') === arr2.join('')

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

export const formatSingleLineAddress = (address: Address) => {
  const parts = ['line1', 'line2', 'town', 'postcode'].map(key => address[key]).filter(Boolean)
  return listToString(parts, '')
}

export const errorMessage = (formError: FormError) => (formError ? { html: formError.text } : undefined)

export const getProperty = <T, U>(obj: T, accessor: string): U => {
  const listOfKeys = accessor.split('.')
  let traversed = obj
  listOfKeys.forEach(key => {
    traversed = traversed?.[key]
  })
  return traversed as unknown as U
}

export const countLabel = ({ count, noun }: { count: number; noun: string }) =>
  `${count} ${noun}${count !== 1 ? 's' : ''}`

export const removeParamsFromQueryString = ({
  paramsToRemove,
  allParams,
}: {
  paramsToRemove: { key: string; value?: string }[]
  allParams: ObjectMap<string | string[]>
}) => {
  const updatedParams = {}
  Object.entries(allParams)
    .filter(([key]) => allParams[key] !== '')
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const updatedValues = value.filter(val => !paramsToRemove.find(param => param.value === val) && val !== '')
        updatedParams[key] = updatedValues.length ? updatedValues : undefined
      } else {
        const toRemove = paramsToRemove.find(paramToRemove => paramToRemove.key === key)
        if (!toRemove) {
          updatedParams[key] = value
        }
      }
    })
  const queryString = qs.stringify(updatedParams, { arrayFormat: 'repeat' })
  return queryString ? `?${queryString}` : ''
}

export const isCaseRestrictedOrExcluded = (userAccessResponse: UserAccessResponse) =>
  userAccessResponse?.userRestricted || userAccessResponse?.userExcluded

export const validateCrn = (crn: unknown) => {
  try {
    if (!isString(crn)) {
      throw new Error()
    }
    if ((crn as string).trim() === '') {
      throw new Error()
    }
    return normalizeCrn(crn as string)
  } catch (err) {
    throw new AppError('Invalid CRN', { status: 400, errorType: 'INVALID_CRN' })
  }
}

export const normalizeCrn = (crn: string) => crn.trim().toUpperCase()

export const isPreprodOrProd = (env?: string) => ['PREPRODUCTION', 'PRODUCTION'].includes(env)

export const booleanToYesNo = (val: boolean) => {
  if (val === true) return 'YES'
  if (val === false) return 'NO'
  return undefined
}

export const isEmptyStringOrWhitespace = (val: string | string[]) => !val || !(val as string).trim()
