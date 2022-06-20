import { RedisClient } from 'redis'
import { getCaseSection } from './getCaseSection'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import * as redisExports from '../../data/redisClient'
import { ContactHistoryResponse } from '../../@types/make-recall-decision-api'

jest.mock('../../data/makeDecisionApiClient')

describe('getCaseSection', () => {
  const crn = ' A1234AB '
  const token = 'token'
  const userId = 'a123-b456'
  const redisSet = jest.fn()
  const redisDel = jest.fn()
  const redisExpire = jest.fn()

  beforeEach(() => {
    jest
      .spyOn(redisExports, 'createRedisClient')
      .mockReturnValue({ set: redisSet, expire: redisExpire, del: redisDel } as unknown as RedisClient)
  })

  it('caches the contact history response in redis if CRN is not excluded or restricted', async () => {
    const apiResponse = {
      contactTypeGroups: [
        {
          groupId: '1',
          label: 'Accredited programme',
          contactTypeCodes: ['C191', 'IVSP'],
        },
      ],
      contactSummary: [
        {
          code: 'C191',
          contactStartDate: '2022-06-03T08:00:00',
          descriptionType: 'Registration Review',
          outcome: null,
          notes:
            'Comment added by John Smith on 05/05/2022 at 17:45\nType: Public Protection - MAPPA\nLevel: MAPPA Level 3\nCategory: MAPPA Cat 3\nNotes: Please Note - Category 3 offenders require multi-agency management at Level 2 or 3 and should not be recorded at Level 1.',
          enforcementAction: 'action 2',
          systemGenerated: false,
        },
      ],
    } as ContactHistoryResponse
    ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    await getCaseSection('contact-history', crn, token, userId, {}, {})
    expect(redisSet).toHaveBeenCalledWith(
      'contactHistory:A1234AB',
      JSON.stringify({ userIds: [userId], data: apiResponse })
    )
  })

  it('does not cache the contact history response in redis if CRN is excluded', async () => {
    const apiResponse = {
      userExcluded: true,
    } as ContactHistoryResponse
    ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    await getCaseSection('contact-history', crn, token, userId, {}, {})
    expect(redisSet).not.toHaveBeenCalled()
    expect(redisDel).toHaveBeenCalledWith('contactHistory:A1234AB')
  })

  it('does not cache the contact history response in redis if CRN is restricted', async () => {
    const apiResponse = {
      userRestricted: true,
    } as ContactHistoryResponse
    ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    await getCaseSection('contact-history', crn, token, userId, {}, {})
    expect(redisSet).not.toHaveBeenCalled()
    expect(redisDel).toHaveBeenCalledWith('contactHistory:A1234AB')
  })
})
