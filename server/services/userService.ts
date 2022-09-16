import convertToTitleCase from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

interface UserDetails {
  name: string
  displayName: string
  email?: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const [userResponse, emailResponse] = await Promise.allSettled([
      this.hmppsAuthClient.getUser(token),
      this.hmppsAuthClient.getUserEmail(token),
    ])
    let email = ''
    if (userResponse.status === 'rejected') {
      throw userResponse.reason
    }
    const user = userResponse.value
    if (emailResponse.status === 'fulfilled') {
      email = emailResponse.value.email
    }
    return { ...user, email, displayName: convertToTitleCase(user.name as string) }
  }
}
