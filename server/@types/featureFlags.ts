export interface FeatureFlagDefault {
  label: string
  default: boolean
}

export type FeatureFlags = {
  [key: string]: boolean
}
