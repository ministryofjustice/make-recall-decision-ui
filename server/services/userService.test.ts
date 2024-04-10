import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import { getUserFromDeliusFacade } from '../data/deliusFacadeClient'
import { getUser, getUserEmail } from '../data/hmppsManageUsersApiClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/deliusFacadeClient')
jest.mock('../data/hmppsManageUsersApiClient')

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
      ;(getUser as jest.Mock).mockReturnValueOnce({
        username: 'MAKE_RECALL_DECISION_USER',
        active: true,
        name: 'John Smith',
        authSource: 'delius',
        userId: '2500485109',
        uuid: 'a0701e84-71a6-4a20-95a7-59082cc57b00',
      })
      ;(getUserEmail as jest.Mock).mockReturnValueOnce({
        username: 'MAKE_RECALL_DECISION_USER',
        email: 'john@gov.uk',
        verified: true,
      })

      hmppsAuthClient.getSystemClientToken.mockResolvedValue('abcdefg')
      ;(getUserFromDeliusFacade as jest.Mock).mockReturnValueOnce({
        homeArea: {
          code: 'N07',
          name: 'London',
        },
      })

      const result = await userService.getUser(token)

      expect(getUserFromDeliusFacade).toHaveBeenCalledWith('MAKE_RECALL_DECISION_USER', 'abcdefg')
      expect(result.displayName).toEqual('John Smith')
      expect(result.email).toEqual('john@gov.uk')
      expect(result.region).toEqual({
        code: 'N07',
        name: 'London',
      })
    })
  })
})
