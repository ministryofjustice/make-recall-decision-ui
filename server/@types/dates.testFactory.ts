import { randomInt } from 'crypto'

// We don't bother with leap years for now
const maxDayInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * Generate a random date between 1st January of the given minYear and 31st December
 * of the given maxYear. Note leap days aren't returned.
 */
export function randomDate(minYear: number = 1900, maxYear: number = 2100) {
  const year: number = randomInt(minYear, maxYear)
  const monthIndex: number = randomInt(0, 12)
  const day: number = randomInt(1, maxDayInMonth[monthIndex] + 1)

  return new Date(year, monthIndex, day)
}

/**
 * Generate a random date and time between 1st January 00:00:00.000 of the given minYear
 * and 31st December 23:59:59.999 of the given maxYear. Note leap days aren't returned.
 */
export function randomDatetime(minYear: number = 1900, maxYear: number = 2100) {
  const date = randomDate(minYear, maxYear)
  const hour: number = randomInt(0, 24)
  const minute: number = randomInt(0, 60)
  const second: number = randomInt(0, 60)
  const millisecond: number = randomInt(0, 1000)

  return new Date(date.getFullYear(), date.getMonth(), date.getDay(), hour, minute, second, millisecond)
}
