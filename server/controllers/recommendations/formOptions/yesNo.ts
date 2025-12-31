import { strings } from '../../../textStrings/en'

export enum YesNoValues {
  YES = 'YES',
  NO = 'NO',
}

export const yesNoOptions = (
  labels: Record<YesNoValues, string> = {
    [YesNoValues.YES]: strings.labels.yes,
    [YesNoValues.NO]: strings.labels.no,
  }
): { value: YesNoValues; text: string }[] => {
  return [
    { value: YesNoValues.YES, text: labels.YES },
    { value: YesNoValues.NO, text: labels.NO },
  ]
}

export function booleanToYesNo(val: boolean) {
  if (val === true) return 'YES'
  if (val === false) return 'NO'
  return undefined
}

export function yesNoToBoolean(value: string) {
  if (value === YesNoValues.YES) return true
  if (value === YesNoValues.NO) return false
  throw new Error(`Invalid value for yesNoToBoolean: ${value}`)
}
