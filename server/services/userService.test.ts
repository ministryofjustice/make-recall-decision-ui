import UserService from './userService'
import HmppsAuthClient, { User, UserEmailResponse } from '../data/hmppsAuthClient'
import { getUserFromDeliusFacade } from '../data/deliusFacadeClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/deliusFacadeClient')

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
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith', username: 'USER1' } as User)
      hmppsAuthClient.getUserEmail.mockResolvedValue({ email: 'john@gov.uk' } as UserEmailResponse)
      hmppsAuthClient.getSystemClientToken.mockResolvedValue('abcdefg')
      ;(getUserFromDeliusFacade as jest.Mock).mockReturnValueOnce({
        homeArea: {
          code: 'N07',
          name: 'London',
        },
      })

      const result = await userService.getUser(token)

      expect(getUserFromDeliusFacade).toHaveBeenCalledWith('USER1', 'abcdefg')
      expect(result.displayName).toEqual('John Smith')
      expect(result.email).toEqual('john@gov.uk')
      expect(result.region).toEqual({
        code: 'N07',
        name: 'London',
      })
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
