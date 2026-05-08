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
  })

  it('it creates and memoizes the client', async () => {
    ;(createClient as jest.Mock).mockResolvedValue(true)

    await featureFlagService.fliptClient()
    await featureFlagService.fliptClient()

    expect(createClient).toHaveBeenCalledTimes(1)
  })

  it('returns flags and evaluates correctly based on the type', async () => {
    const flags = [
      { key: 'a', description: 'A', enabled: true, type: 'BOOLEAN_FLAG_TYPE' },
      { key: 'b', description: 'B', enabled: true, type: 'VARIANT_FLAG_TYPE' },
    ]
    const listFlags = jest.fn().mockResolvedValue(flags)
    const evaluateBoolean = jest.fn().mockResolvedValue({ enabled: true })
    const evaluateVariant = jest.fn().mockResolvedValue({ enabled: true })
    ;(createClient as jest.Mock).mockResolvedValue({ listFlags, evaluateBoolean, evaluateVariant })

    await featureFlagService.getAll()

    expect(evaluateBoolean).toHaveBeenCalledTimes(1)
    expect(evaluateVariant).toHaveBeenCalledTimes(1)
    expect(listFlags).toHaveBeenCalledTimes(1)
  })

  it('throws from fliptClient when createClient fails', async () => {
    ;(createClient as jest.Mock).mockImplementation(() => {
      throw new Error('test error')
    })

    await expect(featureFlagService.fliptClient()).rejects.toThrow('Unable to connect to feature flag service')
  })
})
