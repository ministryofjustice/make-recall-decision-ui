import UserService from './userService'
import HmppsAuthClient, { User, UserEmailResponse } from '../data/hmppsAuthClient'

jest.mock('../data/hmppsAuthClient')

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)
      hmppsAuthClient.getUserEmail.mockResolvedValue({ email: 'john@gov.uk' } as UserEmailResponse)

      const result = await userService.getUser(token)

      expect(result.displayName).toEqual('John Smith')
      expect(result.email).toEqual('john@gov.uk')
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
