import FeatureFlagService from './featureFlagService'
import createClient from '../data/fliptClient'

jest.mock('../data/fliptClient')
jest.mock('../../logger')

describe('Feature flag service', () => {
  let featureFlagService: FeatureFlagService

  beforeEach(() => {
    featureFlagService = new FeatureFlagService()
    featureFlagService.clearCache()
  })

  it('it creates and memoizes the client', async () => {
    ;(createClient as jest.Mock).mockResolvedValue(true)

    await featureFlagService.fliptClient()
    await featureFlagService.fliptClient()

    expect(createClient).toHaveBeenCalledTimes(1)
  })

  it('returns cached flags within TTL', async () => {
    const flags = [{ key: 'a', description: 'A', enabled: true }]
    const listFlags = jest.fn().mockResolvedValue(flags)
    ;(createClient as jest.Mock).mockResolvedValue({ listFlags })

    await featureFlagService.getAll()
    await featureFlagService.getAll()

    expect(listFlags).toHaveBeenCalledTimes(1)
  })

  it('refreshes cache after TTL expires', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const listFlags = jest
      .fn()
      .mockResolvedValueOnce([{ key: 'a', description: 'A', enabled: true }])
      .mockResolvedValueOnce([{ key: 'b', description: 'B', enabled: true }])

    ;(createClient as jest.Mock).mockResolvedValue({ listFlags })

    const cleanService = new FeatureFlagService()

    const firstRun = await cleanService.getAll()
    expect(firstRun).toEqual([{ key: 'a', description: 'A', enabled: true }])

    jest.setSystemTime(new Date('2026-01-01T00:01:00.000Z'))

    const secondRun = await cleanService.getAll()
    expect(secondRun).toEqual([{ key: 'b', description: 'B', enabled: true }])

    expect(listFlags).toHaveBeenCalledTimes(2)
  })

  it('throws from fliptClient when createClient fails', async () => {
    ;(createClient as jest.Mock).mockImplementation(() => {
      throw new Error('test error')
    })

    await expect(featureFlagService.fliptClient()).rejects.toThrow('Unable to connect to feature flag service')
  })
})
