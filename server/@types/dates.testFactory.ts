import { randomInt } from 'crypto'

// We don't bother with leap years for now
const maxDayInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * Generate a random date between 1st January of the given minYear and 31st December
 * of the given maxYear. Note leap days aren't returned.
 */
const randomDate = (minYear: number = 1900, maxYear: number = 2100) => {
  const year: number = randomInt(minYear, maxYear)
  const monthIndex: number = randomInt(0, 12)
  const day: number = randomInt(1, maxDayInMonth[monthIndex] + 1)

  return new Date(year, monthIndex, day)
}

export default randomDate
