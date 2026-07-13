import { Notification } from '../@types/notification'
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'

const notifications: Notification[] = [
  {
    headerText: 'Out-of-hours recalls started on 28 July 2026 will need to be completed by 11:59pm',
    bodyContent:
      'This is because the service needs to be updated in line with new FTR56 rules and changes to the Part A document.',
    startDate: new Date('2026-07-14T23:00:00Z'), // 00:00 15th July 2026 BST
    endDate: new Date('2026-07-28T23:00:00Z'), // 00:00 29th July 2026 BST
    visibleToRoles: [HMPPS_AUTH_ROLE.RW, HMPPS_AUTH_ROLE.ODM],
  },
  {
    headerText: 'Any Part A not downloaded by 11.59pm on 28 July 2026 will be deleted',
    bodyContent:
      'This is because the service needs to be updated in line with new FTR56 rules and changes to the Part A document. You can start the recommendation again after the service resumes at 12am on 29 July 2026.',
    startDate: new Date('2026-07-14T23:00:00Z'), // 00:00 15th July 2026 BST
    endDate: new Date('2026-07-28T23:00:00Z'), // 00:00 29th July 2026 BST
    visibleToRoles: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO],
  },
]

export default notifications
