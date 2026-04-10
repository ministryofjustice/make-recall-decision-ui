import { UiListItem } from '../../../@types/pagesForms'

const getDisplayValueForOption = ({ value, allOptions }: { value: string; allOptions: UiListItem[] }): string => {
  const item = allOptions.find(valueWithOption => valueWithOption.value === value)
  return item ? item.text : value
}

export default getDisplayValueForOption
