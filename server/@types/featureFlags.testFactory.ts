import { randomBoolean } from './boolean.testFactory'
import { FeatureFlags } from './featureFlags'

export function featureFlags(): FeatureFlags {
  return {
    flag1: randomBoolean(),
    flag2: randomBoolean(),
  }
}
