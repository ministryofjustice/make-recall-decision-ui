import randomBoolean from './boolean.testFactory'
import type { FeatureFlags } from './featureFlags'

function featureFlags(): FeatureFlags {
  return {
    flag1: randomBoolean(),
    flag2: randomBoolean(),
  }
}

export default featureFlags
