import { UiListItem } from '../../../@types/pagesForms'

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
