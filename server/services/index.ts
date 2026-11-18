import applicationInfoSupplier from '../applicationInfo'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore'
import { createRedisClient } from '../data/redisClient'
import UserService from './userService'

const applicationInfo = applicationInfoSupplier()

export const services = () => {
  const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient()))

  return {
    applicationInfo,
    userService: new UserService(hmppsAuthClient),
  }
}

export type Services = ReturnType<typeof services>
