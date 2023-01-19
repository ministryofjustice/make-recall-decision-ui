import { getProperty, isDefined, isString } from './utils'

import { UiListItem } from '../@types/pagesForms'

export const sortList = <T>(list: T[], key: string, asc = true): T[] => {
  if (!Array.isArray(list)) {
    return undefined
  }
  return list.sort((a, b) => {
    let valA = getProperty(a, key)
    let valB = getProperty(b, key)
    if (valA && valB) {
      valA = isString(valA) ? (valA as string).toLowerCase() : valA
      valB = isString(valB) ? (valB as string).toLowerCase() : valB
      if (valA < valB) {
        return asc ? -1 : 1
      }
      if (valA > valB) {
        return asc ? 1 : -1
      }
    }
    return 0
  })
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

export const radioCheckboxItems = ({
  items,
  currentValues,
  conditionalContent,
}: {
  items?: UiListItem[]
  currentValues?: string | string[]
  conditionalContent?: Record<string, string>
}) => {
  const valuesToMatch = isDefined(currentValues) && !Array.isArray(currentValues) ? [currentValues] : currentValues
  return items.map(item => {
    return {
      ...item,
      checked: valuesToMatch ? valuesToMatch.includes(item.value) : false,
      conditional:
        conditionalContent && conditionalContent[item.value] ? { html: conditionalContent[item.value] } : undefined,
    }
  })
}

interface ItemWithValue {
  value: string
}
export const findListItemByValue = <T>({ items = [], value }: { items: ItemWithValue[]; value: string }) =>
  items.find(item => item.value === value) as unknown as T

export const cleanseUiList = (items: UiListItem[]) => items.map(({ value, text }: UiListItem) => ({ value, text }))
