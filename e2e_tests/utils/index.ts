import { localData } from './test_data/localData'
import { devData } from './test_data/devData'
import { preprodData } from './test_data/preprodData'

export const getTestDataPerEnvironment = () => {
  if (process.env.ENVIRONMENT === 'dev') {
    return devData
  }
  if (process.env.ENVIRONMENT === 'preprod') {
    return preprodData
  }
  return localData
}
