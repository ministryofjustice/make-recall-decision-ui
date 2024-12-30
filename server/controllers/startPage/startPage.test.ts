import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { startPage } from './startPage'
import { ppudSearchActiveUsers, searchMappedUsers } from '../../data/makeDecisionApiClient'
import searchMappedUsersApiResponse from '../../../api/responses/searchMappedUsers.json'
import ppudSearchActiveUsersApiResponse from '../../../api/responses/ppudSearchActiveUsers.json'

jest.mock('../../data/makeDecisionApiClient')

describe('startPage', () => {
  it('normal operation', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: false } } })
    await startPage(mockReq(), res)
    expect(res.locals.searchEndpoint).toEqual('/search-by-name')
    expect(res.render).toHaveBeenCalledWith('pages/startPage')
  })
  it('with PPCS role', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: true } } })
    ;(searchMappedUsers as jest.Mock).mockReturnValueOnce(searchMappedUsersApiResponse)
    ;(ppudSearchActiveUsers as jest.Mock).mockReturnValueOnce(ppudSearchActiveUsersApiResponse)
    await startPage(mockReq(), res)
    expect(res.render).toHaveBeenCalledWith('pages/startPPCS')
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
})
