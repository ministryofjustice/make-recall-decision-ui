import { UiListItem } from '../../../@types'

export const getDisplayValueForOption = ({
  value,
  allOptions,
}: {
  value: string
  allOptions: UiListItem[]
}): string => {
  const item = allOptions.find(valueWithOption => valueWithOption.value === value)
  return item ? item.text : value
}
