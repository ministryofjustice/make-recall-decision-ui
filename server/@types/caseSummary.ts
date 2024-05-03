export interface Status {
  name: string
  active: boolean
}

export interface RecommendationButton {
  display: boolean
  post?: boolean
  title?: string
  dataAnalyticsEventCategory?: string
  link?: string
}

export interface RecommendationBanner {
  display: boolean
  createdByUserFullName?: string
  createdDate?: string
  personOnProbationName?: string
  recommendationId?: string
  linkText?: string
  text?: string
  dataAnalyticsEventCategory?: string
}
