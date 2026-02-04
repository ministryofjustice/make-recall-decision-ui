import { authorisationCheck, flagIsActive, hasRole, ppcsCustodyGroup, statusIsActive } from './check'
import { STATUSES } from './recommendationStatusCheck'
import { HMPPS_AUTH_ROLE } from './authorisationMiddleware'
import { CUSTODY_GROUP } from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { mockNext, mockReq, mockRes } from './testutils/mockRequestUtils'

jest.mock('../data/makeDecisionApiClient')

describe('statusIsActive', () => {
  it('active status', async () => {
    const result = statusIsActive(STATUSES.SPO_SIGNED)({
      statuses: [
        {
          name: STATUSES.SPO_SIGNED,
          active: true,
        },
      ],
    })

    expect(result).toBe(true)
  })

  it('inactive status', async () => {
    const result = statusIsActive(STATUSES.SPO_SIGNED)({
      statuses: [
        {
          name: STATUSES.SPO_SIGNED,
          active: false,
        },
      ],
    })

    expect(result).toBe(false)
  })

  it('no status', async () => {
    const result = statusIsActive(STATUSES.SPO_SIGNED)({
      statuses: [],
    })

    expect(result).toBe(false)
  })
})

describe('hasRole', () => {
  it('has role', async () => {
    const result = hasRole(HMPPS_AUTH_ROLE.SPO)({
      user: {
        roles: [HMPPS_AUTH_ROLE.SPO],
      },
    })

    expect(result).toBe(true)
  })

  it('does not have role', async () => {
    const result = hasRole(HMPPS_AUTH_ROLE.SPO)({
      user: {
        roles: [],
      },
    })

    expect(result).toBe(false)
  })
})

describe('flagIsActive', () => {
  it('has flag', async () => {
    const result = flagIsActive('flagRecommendationsPage')({
      flags: { flagRecommendationsPage: true },
    })

    expect(result).toBe(true)
  })

  it('flag is not active', async () => {
    const result = flagIsActive('flagRecommendationsPage')({
      flags: { flagRecommendationsPage: false },
    })

    expect(result).toBe(false)
  })
})

describe('ppcsCustodyGroup', () => {
  it('is same', async () => {
    const result = ppcsCustodyGroup(CUSTODY_GROUP.DETERMINATE)({
      recommendation: { bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.DETERMINATE } },
    })

    expect(result).toBe(true)
  })

  it('is different', async () => {
    const result = ppcsCustodyGroup(CUSTODY_GROUP.DETERMINATE)({
      recommendation: { bookRecallToPpud: { custodyGroup: CUSTODY_GROUP.INDETERMINATE } },
    })

    expect(result).toBe(false)
  })

  it('is undefined', async () => {
    const result = ppcsCustodyGroup(CUSTODY_GROUP.DETERMINATE)({
      recommendation: {},
    })

    expect(result).toBe(false)
  })
})

describe('authorisationCheck', () => {
  it('should allow as role is present', async () => {
    const res = mockRes({
      locals: {
        user: {
          roles: ['XYZ'],
        },
      },
    })
    const next = mockNext()

    await authorisationCheck(hasRole('XYZ'))(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should disallow as role is not present', async () => {
    const res = mockRes({
      locals: {
        user: {
          roles: [],
        },
      },
    })
    const next = mockNext()

    await authorisationCheck(hasRole('XYZ'))(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(res.redirect).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })
})
