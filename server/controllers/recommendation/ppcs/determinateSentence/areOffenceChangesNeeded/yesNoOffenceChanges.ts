export enum yesNoOffenceChangesValues {
  YES = 'YES',
  NO = 'NO',
}

export const yesNoOffenceChanges = [
  { value: yesNoOffenceChangesValues.YES, text: 'Yes, change index offence or add a comment' },
  { value: yesNoOffenceChangesValues.NO, text: 'No' },
]

export function booleanToYesNoOffenceChanges(value?: boolean) {
  if (typeof value === 'undefined') return undefined
  return value ? 'YES' : 'NO'
}

export function yesNoOffenceChangesToBoolean(value: string) {
  if (value === 'YES') return true
  if (value === 'NO') return false
  throw new Error(`Invalid value for yesNoOffenceChangesToBoolean: ${value}`)
}
