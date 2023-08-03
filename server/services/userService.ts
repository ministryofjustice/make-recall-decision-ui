import { performance } from 'perf_hooks'
import convertToTitleCase from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { appInsightsTimingMetric } from '../monitoring/azureAppInsights'
import { getUserFromDeliusFacade, HomeArea } from '../data/deliusFacadeClient'

export interface UserDetails {
  name: string
  displayName: string
  email?: string
  region?: HomeArea
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const startTime = performance.now()
    const [userResponse, emailResponse] = await Promise.allSettled([
      this.hmppsAuthClient.getUser(token),
      this.hmppsAuthClient.getUserEmail(token),
    ])
    appInsightsTimingMetric({ name: 'getUser', startTime })
    if (userResponse.status === 'rejected') {
      throw userResponse.reason
    }
    const clientToken = await this.hmppsAuthClient.getSystemClientToken()
    const region = (await getUserFromDeliusFacade(userResponse.value.username, clientToken)).homeArea
    const user = userResponse.value
    let email = ''
    if (emailResponse.status === 'fulfilled') {
      email = emailResponse.value.email
    }
    return { ...user, email, region, displayName: convertToTitleCase(user.name as string) }
  }
}
