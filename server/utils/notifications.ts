import { Notification } from '../@types/notification'
import { notifications } from '../content/notifications'

/**
 * Returns the first active notification banner
 *
 * A notification is considered active if:
 * - The current time is within its `startDate` and `endDate` range.
 * - It is either visible to all users or explicitly includes at least one of the given roles.
 *
 * @param userRoles - An array of roles for the current user.
 * @returns The first matching notification, or null if none match.
 */
export function getActiveNotificationBanner(userRoles: string[]): Notification | null {
  const now = new Date()
  return (
    notifications.find(notification => {
      let matchRole = true
      if (notification.visibleToRoles) {
        matchRole = notification.visibleToRoles?.some(item => userRoles.includes(item))
      }
      const matchTime = notification.startDate <= now && notification.endDate >= now
      return matchRole && matchTime
    }) ?? null
  )
}
