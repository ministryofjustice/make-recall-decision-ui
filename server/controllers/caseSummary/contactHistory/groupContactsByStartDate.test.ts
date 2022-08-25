import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { groupContactsByStartDate } from './groupContactsByStartDate'

describe('groupContactsByStartDate', () => {
  it('sorts contact documents by lastModifiedAt date, newest first; and adds filenames without extensions', () => {
    const contacts = [
      {
        contactStartDate: '2022-05-04T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
        contactDocuments: [
          {
            lastModifiedAt: '2022-07-01T16:03:38.867',
            documentName: 'v1.txt',
          },
          {
            lastModifiedAt: '2022-07-03T16:12:23.586',
            documentName: 'my.document.pdf',
          },
          {
            lastModifiedAt: '2022-07-01T16:57:47.575',
            documentName: 'ANOTHER.docx',
          },
        ],
      },
    ]
    const result = groupContactsByStartDate(contacts)
    expect(result.items[0].items[0].contactDocuments).toEqual([
      {
        lastModifiedAt: '2022-07-03T16:12:23.586',
        documentName: 'my.document.pdf',
      },
      {
        lastModifiedAt: '2022-07-01T16:57:47.575',
        documentName: 'ANOTHER.docx',
      },
      {
        lastModifiedAt: '2022-07-01T16:03:38.867',
        documentName: 'v1.txt',
      },
    ])
  })

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
    ] as ContactSummaryResponse[])
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

  it('applies daylight saving / timezone before grouping', () => {
    const result = groupContactsByStartDate([
      {
        contactStartDate: '2022-07-04T23:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
      {
        contactStartDate: '2022-07-05T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
    ] as ContactSummaryResponse[])
    expect(result).toEqual({
      groupedByKey: 'startDate',
      items: [
        {
          groupValue: '2022-07-05',
          items: [
            {
              contactStartDate: '2022-07-05T13:07:00Z',
              descriptionType: 'Arrest attempt',
              startDate: '2022-07-05',
            },
            {
              contactStartDate: '2022-07-04T23:30:00Z',
              descriptionType: 'Planned Office Visit (NS)',
              startDate: '2022-07-05',
            },
          ],
        },
      ],
    })
  })
})
