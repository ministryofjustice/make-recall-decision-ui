import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'

export interface Notification {
  headerText?: string
  bodyContent: HTMLString
  startDate: Date
  endDate: Date
  visibleToRoles?: HMPPS_AUTH_ROLE[]
  isHidden?: boolean
}

export type HTMLString = string // Making it clear that it can display html
