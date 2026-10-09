import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { startPage } from './startPage'
import config from '../../config'
import { isDateTimeRangeCurrent } from '../../utils/utils'
import hasValidPpudUserMapping from '../../booking/hasValidPpudUserMapping'

jest.mock('../../booking/hasValidPpudUserMapping')

const mockHasValidPpudUserMapping = hasValidPpudUserMapping as jest.MockedFunction<typeof hasValidPpudUserMapping>

describe('startPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the standard start page for a user without PPCS role', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: false } } })

    await startPage(mockReq(), res)

    expect(res.locals.searchEndpoint).toEqual('/search-by-name')
    expect(res.render).toHaveBeenCalledWith('pages/startPage')
    expect(mockHasValidPpudUserMapping).not.toHaveBeenCalled()
  })

  it('sets maintenance banner fields depending on config', async () => {
    const res = mockRes({ locals: { user: { hasPpcsRole: false } } })

    await startPage(mockReq(), res)

    expect(res.locals.maintenanceBanner).toEqual({
      headerText: config.maintenanceBanner.header,
      bodyContent: config.maintenanceBanner.body,
      isHidden: !isDateTimeRangeCurrent(config.maintenanceBanner.startDateTime, config.maintenanceBanner.endDateTime),
    })
  })

  it('renders PPCS start page when user has a valid PPUD mapping', async () => {
    const res = mockRes({
      locals: {
        user: {
          hasPpcsRole: true,
          username: 'username',
          userId: '123',
          token: 'token',
        },
      },
    })

    mockHasValidPpudUserMapping.mockResolvedValueOnce(true)

    await startPage(mockReq(), res)

    expect(mockHasValidPpudUserMapping).toHaveBeenCalledTimes(1)
    expect(mockHasValidPpudUserMapping).toHaveBeenCalledWith({
      username: 'username',
      userId: '123',
      token: 'token',
    })

    expect(res.locals.hasValidPpudUserMapping).toEqual(true)
    expect(res.render).toHaveBeenCalledWith('pages/startPPCS')
  })

  it('renders PPUD user not mapped page when user does not have a valid mapping', async () => {
    const res = mockRes({
      locals: {
        user: {
          hasPpcsRole: true,
          username: 'username',
          userId: '123',
          token: 'token',
        },
      },
    })

    mockHasValidPpudUserMapping.mockResolvedValueOnce(false)

    await startPage(mockReq(), res)

    expect(mockHasValidPpudUserMapping).toHaveBeenCalledTimes(1)
    expect(mockHasValidPpudUserMapping).toHaveBeenCalledWith({
      username: 'username',
      userId: '123',
      token: 'token',
    })

    expect(res.locals.hasValidPpudUserMapping).toEqual(false)
    expect(res.render).toHaveBeenCalledWith('pages/ppudUserNotMapped')
  })

  it('sets maintenance banner fields for PPCS users', async () => {
    const res = mockRes({
      locals: {
        user: {
          hasPpcsRole: true,
          username: 'username',
          userId: '123',
          token: 'token',
        },
      },
    })

    mockHasValidPpudUserMapping.mockResolvedValueOnce(false)

    await startPage(mockReq(), res)

    expect(res.locals.maintenanceBanner).toEqual({
      headerText: config.maintenanceBanner.header,
      bodyContent: config.maintenanceBanner.body,
      isHidden: !isDateTimeRangeCurrent(config.maintenanceBanner.startDateTime, config.maintenanceBanner.endDateTime),
    })
  })

  it('renders PPUD user mappings page for PPCS admin role', async () => {
    const res = mockRes({
      locals: {
        user: {
          hasPpcsRole: false,
          hasPpcsAdminRole: true,
        },
      },
    })

    await startPage(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/recommendations/ppcs/ppudUserMapping/ppudUserMappings')
    expect(mockHasValidPpudUserMapping).not.toHaveBeenCalled()
  })
})
