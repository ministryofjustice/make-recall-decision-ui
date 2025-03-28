import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { startPage } from './startPage'
import { ppudSearchActiveUsers, searchMappedUsers } from '../../data/makeDecisionApiClient'
import searchMappedUsersApiResponse from '../../../api/responses/searchMappedUsers.json'
import ppudSearchActiveUsersApiResponse from '../../../api/responses/ppudSearchActiveUsers.json'
import * as caching from '../../data/fetchFromCacheOrApi'
import config from '../../config'
import { isDateTimeRangeCurrent } from '../../utils/utils'

jest.mock('../../data/makeDecisionApiClient')

describe('startPage', () => {
  it('normal operation', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: false } } })
    await startPage(mockReq(), res)
    expect(res.locals.searchEndpoint).toEqual('/search-by-name')
    expect(res.render).toHaveBeenCalledWith('pages/startPage')
  })
  it('ensure notification fields returned depending on config', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: false } } })
    await startPage(mockReq(), res)
    expect(res.locals.notification).toEqual({
      header: config.notification.header,
      body: config.notification.body,
      startDateTime: config.notification.startDateTime,
      endDateTime: config.notification.endDateTime,
      isVisible: isDateTimeRangeCurrent(config.notification.startDateTime, config.notification.endDateTime),
    })
  })
  it('with PPCS role and caches ppud user', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: true, username: 'username', userId: '123' } } })
    ;(searchMappedUsers as jest.Mock).mockReturnValueOnce(searchMappedUsersApiResponse)
    ;(ppudSearchActiveUsers as jest.Mock).mockReturnValueOnce(ppudSearchActiveUsersApiResponse)
    const spy = jest.spyOn(caching, 'fetchFromCacheOrApi')
    spy.mockReturnValueOnce(Promise.resolve(ppudSearchActiveUsersApiResponse))

    await startPage(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/startPPCS')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenNthCalledWith(1, {
      checkWhetherToCacheDataFn: expect.any(Function),
      fetchDataFn: expect.any(Function),
      redisKey: `ppudUserResponse:${res.locals.user.username}`,
      ttlOverrideSeconds: 60 * 60 * 24 * 7,
      userId: res.locals.user.userId,
    })
    expect(res.locals.validMappingAndPpudUser).toEqual(true)
  })
  it('with PPCS role and no mapped user', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: true } } })
    ;(searchMappedUsers as jest.Mock).mockReturnValueOnce({ ppudUserMapping: null })
    ;(ppudSearchActiveUsers as jest.Mock).mockReturnValueOnce({})
    await startPage(mockReq(), res)
    expect(res.render).toHaveBeenCalledWith('pages/startPPCS')
    expect(res.locals.validMappingAndPpudUser).toEqual(undefined)
  })
  it('with PPCS role and mapped user but no active ppud user', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: true } } })
    ;(searchMappedUsers as jest.Mock).mockReturnValueOnce(searchMappedUsersApiResponse)
    ;(ppudSearchActiveUsers as jest.Mock).mockReturnValueOnce({ results: [] })
    await startPage(mockReq(), res)
    expect(res.render).toHaveBeenCalledWith('pages/startPPCS')
    expect(res.locals.validMappingAndPpudUser).toEqual(false)
  })
  it('with PPCS role ensure notification fields returned depending on config', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: true } } })
    ;(searchMappedUsers as jest.Mock).mockReturnValueOnce(searchMappedUsersApiResponse)
    ;(ppudSearchActiveUsers as jest.Mock).mockReturnValueOnce({ results: [] })
    await startPage(mockReq(), res)
    expect(res.locals.notification).toEqual({
      header: config.notification.header,
      body: config.notification.body,
      startDateTime: config.notification.startDateTime,
      endDateTime: config.notification.endDateTime,
      isVisible: isDateTimeRangeCurrent(config.notification.startDateTime, config.notification.endDateTime),
    })
  })
})
