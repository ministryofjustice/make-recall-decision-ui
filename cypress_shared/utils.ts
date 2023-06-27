import { DateTime } from 'luxon'

export const exactMatchIgnoreWhitespace = (str: string): RegExp => new RegExp(`^\\s*${str}\\s*$`, 'g')

export const addToNow = (
  adjustment: { year?: number; month?: number; day?: number; hour?: number; minute?: number },
  { includeTime }: { includeTime?: boolean } = {}
): { year: string; month: string; day: string; hour?: string; minute?: string } => {
  const futureDateParts = DateTime.now().plus(adjustment).toObject()
  return Object.entries(futureDateParts).reduce(
    (acc, [key, value]) => {
      if (['hour', 'minute'].includes(key) && includeTime !== true) {
        return acc
      }
      return { ...acc, [key]: value.toString() }
    },
    {
      year: undefined,
      month: undefined,
      day: undefined,
    }
  )
}

export const formatIsoDate = (isoDate: string) => DateTime.fromISO(isoDate, { zone: 'utc' }).toFormat('d MMMM yyyy')

export const formatIsoDateShort = (isoDate: string) => DateTime.fromISO(isoDate, { zone: 'utc' }).toFormat('dd/MM/yyyy')

export const longDateMatchPattern = (isoDate: string | null) => {
  return isoDate !== null ? new RegExp(formatIsoDate(isoDate)) : /\d{1,2} [a-zA-Z]* \d{4}/
}

export const replaceMissingNDeliusInfoWithBlank = function (text: string) {
  return text === '-This is information missing from NDelius.' ? '' : text
}
export const replaceMissingNDeliusInfoWithNotSpecified = function (text: string) {
  return text === '-This is information missing from NDelius.' ? 'Not specified' : text
}
