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

export const formatDateToDNTRLetterFormat = (objectDate: Date) => {
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
  cy.log(`objectDate--> ${objectDate.toDateString()} at ${objectDate.toTimeString()}`)
  return DateTime.fromObject({
    year: objectDate.getFullYear(),
    month: objectDate.getMonth() + 1,
    day: objectDate.getDate(),
    weekday: objectDate.getDay(),
    hour: objectDate.getHours(),
    minute: objectDate.getMinutes(),
    second: objectDate.getSeconds(),
  }).toFormat(`EEEE d'${nth(objectDate.getDate())}' MMMM yyyy 'at' h':'mma`)
}
