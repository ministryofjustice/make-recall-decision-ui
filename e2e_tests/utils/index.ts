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

export const formatObjectDate = (objectDate: Record<string, number | string>) => {
  const d = DateTime.fromObject(objectDate)
  return d.toFormat('dd/LL/yyyy')
}

export const changeDateFromLongFormatToShort = (dateToConvert: string) => {
  return DateTime.fromFormat(dateToConvert, 'dd MMMM yyyy').toFormat('dd/MM/yyyy')
}
