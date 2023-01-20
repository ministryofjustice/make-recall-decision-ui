import nunjucks from 'nunjucks'
import { DateTime } from 'luxon'
import { DatePartsParsed } from '../@types/dates'

import { SelectedFilterItem } from '../@types/contacts'
import { FormError, UrlInfo } from '../@types/pagesForms'

export const dateTimeItems = (fieldName: string, values: DatePartsParsed) => {
  const items = [
    {
      name: `day`,
      label: 'Day',
      classes: 'govuk-input--width-2',
      attributes: {
        maxlength: 2,
      },
      value: values?.day,
    },
    {
      name: `month`,
      label: 'Month',
      classes: 'govuk-input--width-2',
      type: 'number',
      attributes: {
        maxlength: 2,
      },
      value: values?.month,
    },
    {
      name: `year`,
      label: 'Year',
      classes: 'govuk-input--width-4',
      attributes: {
        maxlength: 4,
      },
      value: values?.year,
    },
  ]
  return items
}

export const selectedFilterItems = ({ items, urlInfo }: { items: SelectedFilterItem[]; urlInfo: UrlInfo }) =>
  items.map(item => ({ ...item, href: `${urlInfo.path}${item.href}` }))

export const removeUndefinedListItems = (items: unknown[]) => items.filter(Boolean)

export const renderTemplateString = (str: string, data: Record<string, unknown>): string => {
  const env = nunjucks.configure({ autoescape: false })
  return env.renderString(str, data)
}
export const isDatePartInvalid = (datePart: string, errors: FormError) =>
  Array.isArray(errors?.invalidParts) && errors.invalidParts.includes(datePart)

export const possessiveSuffix = (str: string) => (str.endsWith('s') ? `${str}'` : `${str}'s`)

export const riskLevelLabel = (level: string) => {
  switch (level) {
    case 'VERY_HIGH':
      return 'Very high'
    case 'HIGH':
      return 'High'
    case 'MEDIUM':
      return 'Medium'
    case 'LOW':
      return 'Low'
    default:
      return level
  }
}

export const roshYesNoLabel = (level: string | null) => {
  switch (level) {
    case 'YES':
      return 'Yes'
    case 'NO':
      return 'No'
    case 'DK':
      return "Don't know"
    case 'NA':
      return 'N/A'
    case null:
    case undefined:
      return 'No value - check OASys'
    default:
      return level
  }
}

export const defaultValue = (val?: string) =>
  val || '-<span class="govuk-visually-hidden">This is information missing from NDelius.</span>'

export const formatDateFilterQueryString = (isoDate: string) => {
  const dateParts = DateTime.fromISO(isoDate).toObject()
  return `dateFrom-day=${dateParts.day}&dateFrom-month=${dateParts.month}&dateFrom-year=${dateParts.year}&dateTo-day=${dateParts.day}&dateTo-month=${dateParts.month}&dateTo-year=${dateParts.year}`
}

// does the array contain an object that has all the specified properties
export const isObjectInArray = ({
  properties,
  arr,
}: {
  properties: Record<string, unknown>
  arr?: Record<string, unknown>[]
}) =>
  Array.isArray(arr) && properties
    ? arr.some(item => {
        return Object.entries(properties).every(([key, val]) => item[key] === val)
      })
    : false

export const countLabelSuffix = ({ count, label }: { count: number; label: string }) =>
  `${label}${count === 1 ? '' : 's'}`
