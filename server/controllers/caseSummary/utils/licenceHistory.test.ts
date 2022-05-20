import { groupContactsByStartDate } from './licenceHistory'
import { ContactSummary } from '../../../@types/make-recall-decision-api/models/ContactSummary'

describe('groupContactsByStartDate', () => {
  it('returns a list grouped by start date', () => {
    const result = groupContactsByStartDate([
      {
        contactStartDate: '2022-05-04T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
      {
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
    ] as ContactSummary[])
    expect(result).toEqual({
      groupedByKey: 'startDate',
      items: [
        {
          groupValue: '2022-05-04',
          items: [
            {
              contactStartDate: '2022-05-04T13:07:00Z',
              descriptionType: 'Arrest attempt',
              startDate: '2022-05-04',
            },
            {
              contactStartDate: '2022-05-04T11:30:00Z',
              descriptionType: 'Planned Office Visit (NS)',
              startDate: '2022-05-04',
            },
          ],
        },
        {
          groupValue: '2022-04-21',
          items: [
            {
              contactStartDate: '2022-04-21T10:03:00Z',
              descriptionType: 'Management Oversight - Recall',
              startDate: '2022-04-21',
            },
          ],
        },
      ],
    })
  })
})
