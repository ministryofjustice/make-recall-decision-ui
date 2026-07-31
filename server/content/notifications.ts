import { Notification } from '../@types/notification'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'

/**
 * This will display a notification banner on the PoP overview within the given
 * timeframe and filterable by HMPPS_AUTH_ROLE
 * [See: https://design-system.service.gov.uk/components/notification-banner/]
 *
 * To create a banner an item to the notifications array with the following structure:
  {
    headerText: 'Warning about the thing which will happen',
    bodyContent: 'Further details on why this is happening.',
    startDate: new Date('2026-07-14T23:00:00Z'), // Z-Indexed ISO Date
    endDate: new Date('2026-07-28T23:00:00Z'), // Z-Indexed ISO Date
    visibleToRoles: [HMPPS_AUTH_ROLE.RW], // Array of HMPPS_AUTH_ROLEs
  },
 */
const notifications: Notification[] = []

export default notifications
