import { Notification } from '../@types/notification'
import { HMPPS_AUTH_ROLE } from '../middleware/authorisationMiddleware'

// TODO: Update start dates to match those in MRD-2788 after this has been tested on dev
export const notifications: Notification[] = [
  {
    headerText: 'Out-of-hours recalls started on 1 September 2025 will need to completed by 11:59pm',
    bodyContent: 'This is because the service needs to be updated in line with FTR48 rules.',
    startDate: new Date('2025-08-10T00:00:00Z'), // new Date('2025-08-19T00:00:00Z'),
    endDate: new Date('2025-09-09T00:00:00Z'),
    visibleToRoles: [HMPPS_AUTH_ROLE.RW],
  },
  {
    headerText: 'Any Part A not downloaded by 11.59pm on 1 September 2025 will be deleted',
    bodyContent:
      'This is because the service needs to be updated in line with FTR48 rules. You can start the recommendation again after the service resumes at 12am on 2 September.',
    startDate: new Date('2025-08-10T00:00:00Z'), // new Date('2025-08-19T00:00:00Z')
    endDate: new Date('2025-09-09T00:00:00Z'),
    visibleToRoles: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO, HMPPS_AUTH_ROLE.ODM],
  },
]
