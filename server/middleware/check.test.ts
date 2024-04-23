import { flagIsActive, hasRole, statusIsActive } from './check'
import { STATUSES } from './recommendationStatusCheck'
import { HMPPS_AUTH_ROLE } from './authorisationMiddleware'

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
