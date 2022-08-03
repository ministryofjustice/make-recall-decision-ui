import { UiListItem } from '../../../@types'

interface ValueWithOptions {
  value: string
  options: UiListItem[]
}
export const getDisplayValueForOption = (valueWithOptions: ValueWithOptions): string => {
  const item = valueWithOptions.options.find(valueWithOption => valueWithOption.value === valueWithOptions.value)
  return item ? item.text : valueWithOptions.value
}
