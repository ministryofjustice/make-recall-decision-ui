import { DateTime } from 'luxon'
import { localData } from './test_data/localData'
import { devData } from './test_data/devData'
import { preprodData } from './test_data/preprodData'
import { sharedInputData } from './test_data/sharedInputData'

export const getTestDataPerEnvironment = () => {
  let overrides = {}
  if (Cypress.env('ENV') === 'dev') {
    overrides = devData
  } else if (Cypress.env('ENV') === 'preprod') {
    overrides = preprodData
  }
  return {
    ...sharedInputData,
    ...localData,
    ...overrides,
  }
}

export const isoDateToObject = (isoDate: string) => {
  const d = DateTime.fromISO(isoDate)
  const { day, month, year } = d.toObject()
  return { day, month, year }
}

export const formatObjectDateToLongFormat = (objectDate: Record<string, number | string>) => {
  const d = DateTime.fromObject(objectDate)
  return d.toFormat('d MMMM yyyy')
}

export const changeDateFromLongFormatToShort = (dateToConvert: string) => {
  return DateTime.fromFormat(dateToConvert, 'dd MMMM yyyy').toFormat('dd/MM/yyyy')
}

export const formatDateToDNTRLetterFormat = objectDate => {
  const d = objectDate
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const weekDay = weekDays[d.getDay()]
  let hr = d.getHours()
  let min = d.getMinutes()
  if (min < 10) {
    min = `0${min}`
  }
  let ampm = 'am'
  if (hr > 12) {
    hr -= 12
    ampm = 'pm'
  }
  const date = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const nth = function (rawDate) {
    if (rawDate > 3 && rawDate < 21) return 'th'
    switch (rawDate % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }
  return `${weekDay} ${date}${nth(date)} ${month} ${year} at ${hr}:${min}${ampm}`
}
