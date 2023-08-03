import RestClient from './restClient'
import config from '../config'

function restClient(token?: string): RestClient {
  return new RestClient('DeliusFacadeClient', config.apis.makeRecallDecisionsDeliusFacade, token)
}

export async function getUserFromDeliusFacade(username: string, clientToken: string): Promise<User> {
  return (await restClient(clientToken).get({ path: `/user/${username}` })) as User
}

export interface Name {
  forename: string
  middleName?: string
  surname: string
}

export interface HomeArea {
  code?: string
  name?: string
}

export interface User {
  name: Name
  username: string
  email?: string
  homeArea?: HomeArea
  staffCode?: string
}
