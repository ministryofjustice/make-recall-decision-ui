import localData from './test_data/localData.json'
import devData from './test_data/devData.json'
import preprodData from './test_data/preprodData.json'
import { DateTime } from 'luxon'

export const getTestDataPerEnvironment = () => {
  if (process.env.ENVIRONMENT === 'dev') {
    return devData
  } else if (process.env.ENVIRONMENT === 'preprod') {
    return preprodData
  }
  return localData
}

export function formatDate() {
  const date = new Date()

  return [padTo2Digits(date.getDate()), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join('/')
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0')
}
