import { getProperty } from './utils'

export const sortList = <T>(list: T[], key: string, asc = true): T[] => {
  if (!Array.isArray(list)) {
    return undefined
  }
  return list.sort((a, b) => {
    const valA = getProperty(a, key)
    const valB = getProperty(b, key)
    if (valA < valB) {
      return asc ? -1 : 1
    }
    if (valA > valB) {
      return asc ? 1 : -1
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
