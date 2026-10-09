import { Notification } from '../@types/notification'

import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'

/**
 * This will display a notification banner on the PoP overview within the given
 * timeframe and filterable by HMPPS_AUTH_ROLE
 * [See: https://design-system.service.gov.uk/components/notification-banner/]
 *
 * It's worth noting that this component will search through the array in order until
 * it finds an entry which matches the current user role and then display that one.
 *
 * Given that everyone has the PO role, if you want things like RW or ODM to have their
 * own separate banner (usually an "out-of-hours" variant) then you need to add them
 * so they're **earlier** in the array than any with the PO Role and therefore get picked
 * up for those users with the other roles.
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
const notifications: Notification[] = [
  {
    headerText: 'Out-of-hours recalls started on 30 September 2026 will need to be completed by 11:59pm',
    bodyContent:
      'This is because the service needs to be updated in line with licence condition updates and changes to the Part A document.',
    startDate: new Date('2026-09-16T00:00:00Z'), // Z-Indexed ISO Date
    endDate: new Date('2026-09-30T22:59:59Z'), // Z-Indexed ISO Date
    visibleToRoles: [HMPPS_AUTH_ROLE.ODM, HMPPS_AUTH_ROLE.RW],
  },
  {
    headerText: 'Any Part A not downloaded by 11.59pm on 30 September 2026 will be deleted',
    bodyContent:
      'This is because the service needs to be updated in line with licence condition updates and changes to the Part A document. You can start the recommendation again after the service resumes at 12am on 1st October 2026.',
    startDate: new Date('2026-09-16T00:00:00Z'), // Z-Indexed ISO Date
    endDate: new Date('2026-09-30T22:59:59Z'), // Z-Indexed ISO Date
    visibleToRoles: [HMPPS_AUTH_ROLE.SPO, HMPPS_AUTH_ROLE.PO],
  },
]

export default notifications
