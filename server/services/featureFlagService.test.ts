import FeatureFlagService from './featureFlagService'
import createClient from '../data/fliptClient'
import { HmppsAuthUserGenerator } from '../../data/hmpps-auth/UserGenerator'

jest.mock('../data/fliptClient')
jest.mock('../../logger')

describe('Feature flag service', () => {
  let featureFlagService: FeatureFlagService
  const mockUser = HmppsAuthUserGenerator.generate()

  beforeEach(() => {
    featureFlagService = new FeatureFlagService(mockUser)
    featureFlagService.clearCache()
  })

  it('it creates and memoizes the client', async () => {
    ;(createClient as jest.Mock).mockResolvedValue(true)

    await featureFlagService.fliptClient()
    await featureFlagService.fliptClient()

    expect(createClient).toHaveBeenCalledTimes(1)
  })

  it('returns cached flags within TTL', async () => {
    const flags = [
      { key: 'a', description: 'A', enabled: true, type: 'BOOLEAN_FLAG_TYPE' },
      { key: 'b', description: 'B', enabled: true, type: 'VARIANT_FLAG_TYPE' },
    ]
    const listFlags = jest.fn().mockResolvedValue(flags)
    const evaluateBoolean = jest.fn().mockResolvedValue({ enabled: true })
    const evaluateVariant = jest.fn().mockResolvedValue({ enabled: true })
    ;(createClient as jest.Mock).mockResolvedValue({ listFlags, evaluateBoolean, evaluateVariant })

    await featureFlagService.getAll()
    await featureFlagService.getAll()

    expect(evaluateBoolean).toHaveBeenCalledTimes(1)
    expect(evaluateVariant).toHaveBeenCalledTimes(1)
    expect(listFlags).toHaveBeenCalledTimes(1)
  })

  it('refreshes cache after TTL expires', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const listFlags = jest
      .fn()
      .mockResolvedValueOnce([
        { key: 'a', description: 'A', enabled: true, type: 'BOOLEAN_FLAG_TYPE' },
        { key: 'b', description: 'B', enabled: true, type: 'VARIANT_FLAG_TYPE' },
      ])
      .mockResolvedValueOnce([
        { key: 'c', description: 'C', enabled: true, type: 'BOOLEAN_FLAG_TYPE' },
        { key: 'd', description: 'D', enabled: true, type: 'VARIANT_FLAG_TYPE' },
      ])
    const evaluateBoolean = jest.fn().mockResolvedValue({ enabled: true })
    const evaluateVariant = jest.fn().mockResolvedValue({ enabled: true })
    ;(createClient as jest.Mock).mockResolvedValue({ listFlags, evaluateBoolean, evaluateVariant })

    const cleanService = new FeatureFlagService(mockUser)

    const firstRun = await cleanService.getAll()
    expect(firstRun).toEqual([
      { key: 'a', description: 'A', enabled: true, type: 'BOOLEAN_FLAG_TYPE' },
      { key: 'b', description: 'B', enabled: true, type: 'VARIANT_FLAG_TYPE' },
    ])

    jest.setSystemTime(new Date('2026-01-01T00:01:00.000Z'))

    const secondRun = await cleanService.getAll()
    expect(secondRun).toEqual([
      { key: 'c', description: 'C', enabled: true, type: 'BOOLEAN_FLAG_TYPE' },
      { key: 'd', description: 'D', enabled: true, type: 'VARIANT_FLAG_TYPE' },
    ])

    expect(listFlags).toHaveBeenCalledTimes(2)
  })

  it('throws from fliptClient when createClient fails', async () => {
    ;(createClient as jest.Mock).mockImplementation(() => {
      throw new Error('test error')
    })

    await expect(featureFlagService.fliptClient()).rejects.toThrow('Unable to connect to feature flag service')
  })
})
