import nunjucks from 'nunjucks'
import { DatePartsParsed } from '../@types/dates'
import { FormError, ObjectMap, SelectedFilterItem, UrlInfo } from '../@types'

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

export const renderTemplateString = (str: string, data: ObjectMap<unknown>): string => {
  const env = nunjucks.configure({ autoescape: false })
  return env.renderString(str, data)
}
export const isDatePartInvalid = (datePart: string, errors: FormError) =>
  Array.isArray(errors?.invalidParts) && errors.invalidParts.includes(datePart)
