import { performance } from 'perf_hooks'
import convertToTitleCase from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { getUserFromDeliusFacade, HomeArea } from '../data/deliusFacadeClient'
import { getUser, getUserEmail } from '../data/hmppsManageUsersApiClient'
import { appInsightsTimingMetric } from '../monitoring/azureAppInsights'

export interface UserDetails {
  name: string
  displayName: string
  email?: string
  region?: HomeArea
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {
    // Do nothing
  }

  async getUser(token: string): Promise<UserDetails> {
    let startTime = performance.now()
    const results = await Promise.all([getUser(token), getUserEmail(token)])
    const user = Object.assign(...results)
    appInsightsTimingMetric({ name: 'getUser', startTime })

    startTime = performance.now()
    const clientToken = await this.hmppsAuthClient.getSystemClientToken()
    const region = (await getUserFromDeliusFacade(user.username, clientToken)).homeArea
    appInsightsTimingMetric({ name: 'getUserFromDeliusFacade', startTime })

    return { name: user.name, email: user.email, region, displayName: convertToTitleCase(user.name) }
  }
}
