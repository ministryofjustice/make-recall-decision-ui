export interface FeatureFlagDefault {
  label: string
  description: string
  default: boolean
}

export type FeatureFlags = {
  [key: string]: boolean
}
