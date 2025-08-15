import { getActiveNotificationBanner } from './notifications'
import { Notification } from '../@types/notification'
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'

import { notifications } from '../content/notifications'

jest.mock('../content/notifications', () => ({
  __esModule: true,
  notifications: [] as Notification[],
}))

describe('Notifications', () => {
  describe('getActiveNotificationBanner', () => {
    // Set a fixed current time for consistency
    const fixedNow = new Date('2025-08-12T12:00:00Z')
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(fixedNow)
    })
    afterAll(() => {
      jest.useRealTimers()
    })
    beforeEach(() => {
      notifications.length = 0 // Reset notifications before each test
    })
    // Reusable, timed notifications
    const activeNotification = {
      headerText: 'Heading text',
      bodyContent: 'Body text',
      startDate: new Date('2025-08-01T00:00:00Z'),
      endDate: new Date('2025-08-20T00:00:00Z'),
    }
    const pastNotification = {
      headerText: 'Heading text',
      bodyContent: 'Body text',
      startDate: new Date('2025-08-01T00:00:00Z'),
      endDate: new Date('2025-08-10T00:00:00Z'),
    }
    const futureNotification = {
      headerText: 'Heading text',
      bodyContent: 'Body text',
      startDate: new Date('2025-08-20T00:00:00Z'),
      endDate: new Date('2025-08-28T00:00:00Z'),
    }
    describe('Selection logic', () => {
      it('returns null when there are no notifications', () => {
        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO])
        expect(result).toBeNull()
      })
      it('returns a notification when the role matches and the current date is between the startDate and endDate', () => {
        const notification = {
          ...activeNotification,
          visibleToRoles: [HMPPS_AUTH_ROLE.PO],
        }
        notifications.push(notification)
        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO])
        expect(result).toEqual({ ...activeNotification, visibleToRoles: [HMPPS_AUTH_ROLE.PO] })
      })
      it('returns null when the role matches but the end date is in the past', () => {
        const notification = {
          ...pastNotification,
          visibleToRoles: [HMPPS_AUTH_ROLE.PO],
        }
        notifications.push(notification)
        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO])
        expect(result).toBeNull()
      })
      it('returns null when the role matches but the start date is in the future', () => {
        const notification = {
          ...futureNotification,
          visibleToRoles: [HMPPS_AUTH_ROLE.PO],
        }
        notifications.push(notification)
        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO])
        expect(result).toBeNull()
      })
      it('returns null when the role matches but the end date is before the start date', () => {
        const notification = {
          headerText: 'Heading text',
          bodyContent: 'Body text',
          startDate: new Date('2025-08-20T00:00:00Z'),
          endDate: new Date('2025-08-10T00:00:00Z'),
          visibleToRoles: [HMPPS_AUTH_ROLE.PO],
        }
        notifications.push(notification)
        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO])
        expect(result).toBeNull()
      })
      it('returns null when the date matches but the role does not', () => {
        const notification = {
          ...activeNotification,
          visibleToRoles: [HMPPS_AUTH_ROLE.SPO],
        }
        notifications.push(notification)
        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO])
        expect(result).toBeNull()
      })
      it('returns a notification if visibleToRoles is null but there is a date match', () => {
        notifications.push(activeNotification)
        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO])
        expect(result).toEqual(activeNotification)
      })
      it('returns the first matching notification when there are multiple matches', () => {
        const notificationOne = {
          ...activeNotification,
          visibleToRoles: [HMPPS_AUTH_ROLE.PO],
        }
        const notificationTwo = {
          ...activeNotification,
          visibleToRoles: [HMPPS_AUTH_ROLE.SPO],
        }
        notifications.push(notificationOne, notificationTwo)

        const result = getActiveNotificationBanner([HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO])
        expect(result).toEqual(notificationOne)
      })
    })
    describe('Date boundaries', () => {
      it('returns a notification when startDate is exactly now', () => {
        notifications.push({
          bodyContent: 'Start date boundary test',
          startDate: fixedNow,
          endDate: new Date('2025-08-15T00:00:00Z'),
        })

        const result = getActiveNotificationBanner([])
        expect(result?.bodyContent).toBe('Start date boundary test')
      })
    })
    it('returns a notification when endDate is exactly now', () => {
      notifications.push({
        bodyContent: 'End date boundary test',
        startDate: new Date('2025-08-10T00:00:00Z'),
        endDate: fixedNow,
      })

      const result = getActiveNotificationBanner([])
      expect(result?.bodyContent).toBe('End date boundary test')
    })
  })
})
