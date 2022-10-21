import { localData } from './test_data/localData'
import { devData } from './test_data/devData'
import { preprodData } from './test_data/preprodData'

export const getTestDataPerEnvironment = () => {
  if (Cypress.env('ENV') === 'dev') {
    return devData
  }
  if (Cypress.env('ENV') === 'preprod') {
    return preprodData
  }
  return localData
}
