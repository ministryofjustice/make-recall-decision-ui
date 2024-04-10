import logger from '../../logger'
import { User, UserEmailResponse } from './hmppsAuthClient'
import RestClient from './restClient'
import config from '../config'

function restClient(token?: string): RestClient {
  return new RestClient('ManageUsersApiClient', config.apis.hmppsManageUsersApi, token)
}

export function getUser(token: string): Promise<User> {
  logger.info(`Getting user details: calling HMPPS Manage Users Api `)
  return restClient(token).get({ path: '/users/me' }) as Promise<User>
}

export function getUserEmail(token: string): Promise<UserEmailResponse> {
  logger.info(`Getting user email: calling HMPPS Manage Users Api `)
  return restClient(token).get({ path: '/users/me/email' }) as Promise<UserEmailResponse>
}
