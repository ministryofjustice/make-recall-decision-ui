import { DateTime } from 'luxon'
import { localData } from './test_data/localData'
import { devData } from './test_data/devData'
import { preprodData } from './test_data/preprodData'
import { sharedInputData } from './test_data/sharedInputData'
import { DatePartNames } from '../../server/@types/dates'

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
  return d.toObject()
}

export const formatObjectDate = (objectDate: Record<DatePartNames, string>) => {
  const d = DateTime.fromObject(objectDate)
  return d.toFormat('dd/LL/yyyy')
}
