import { DatePartsParsed } from '../@types/dates'
import { SelectedFilterItem, UiListItem, UrlInfo } from '../@types'

export const dateTimeItems = (fieldName: string, values: DatePartsParsed, includeTime?: boolean) => {
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
  if (includeTime) {
    return [
      ...items,
      {
        name: `${fieldName}Hour`,
        label: 'Hour',
        classes: 'govuk-input--width-2',
        type: 'number',
        attributes: {
          maxlength: 2,
        },
        value: values?.hour,
      },
      {
        name: `${fieldName}Minute`,
        label: 'Minute',
        classes: 'govuk-input--width-2',
        attributes: {
          maxlength: 2,
        },
        value: values?.minute,
      },
    ]
  }
  return items
}

export const checkboxItems = ({ items, currentValues }: { items?: UiListItem[]; currentValues?: string[] }) => {
  return items.map(item => {
    return {
      ...item,
      checked: currentValues?.includes(item.value) || undefined,
    }
  })
}

export const selectedFilterItems = ({ items, urlInfo }: { items: SelectedFilterItem[]; urlInfo: UrlInfo }) =>
  items.map(item => ({ ...item, href: `${urlInfo.path}${item.href}` }))

export const removeUndefinedListItems = (items: unknown[]) => items.filter(Boolean)
