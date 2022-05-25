import { transformLicenceHistory } from './transformLicenceHistory'
import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'

describe('transformLicenceHistory', () => {
  const contactSummary = [
    {
      contactStartDate: '2022-05-04T13:07:00Z',
      descriptionType: 'Arrest attempt',
      outcome: null,
      notes:
        'Good afternoon, the police attempted to arrest Mr. Edwin at 18 Serata Street today, they forced entry but he was not present. We have a contractor repairing the door and changing the locks so that Mr. Edwin will not be able to return. Kind regards, PC Street',
      enforcementAction: null,
      systemGenerated: true,
    },
    {
      contactStartDate: '2022-04-21T10:03:00Z',
      descriptionType: 'Management Oversight - Recall',
      outcome: 'Decision to Recall',
      notes:
        'Comment added by Jane Pavement on 21/04/2022 at 10:40\nEnforcement Action:  A standard recall is appropriate here because Mr. Edwin has lost his current accommodation as a result of concerns related to drug supply. There are ongoing concerns about his alcohol misuse and poor engagement with probation appointments. A standard recall will allow Mr. Edwin to address his alcohol abuse and consider most appropriate accommodation on release.',
      enforcementAction: null,
      systemGenerated: false,
    },
    {
      contactStartDate: '2022-04-21T11:30:00Z',
      descriptionType: 'Planned Office Visit (NS)',
      outcome: 'Failed to Attend',
      notes: 'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
      enforcementAction: 'Decision Pending Response from Person on Probation',
      systemGenerated: true,
    },
  ]

  it('sets contacts count to the number of filtered items, and returns the selected filters', () => {
    const { errors, data } = transformLicenceHistory({
      caseSummary: { contactSummary } as LicenceHistoryResponse,
      filters: {
        'dateFrom-day': '21',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
      },
    })
    expect(errors).toBeUndefined()
    // contact count is 1 because 1 of the 3 items was filtered out as system-generated, and another by the date range
    expect(data.contactCount).toEqual(1)
    expect(data.filters).toEqual({
      dateRange: {
        dateFrom: {
          day: '21',
          month: '04',
          year: '2022',
        },
        dateTo: {
          day: '21',
          month: '04',
          year: '2022',
        },
        selectedLabel: '21 Apr 2022 to 21 Apr 2022',
      },
    })
  })

  it('returns all contacts if system generated are included, and no date filter', () => {
    const { errors, data } = transformLicenceHistory({
      caseSummary: { contactSummary } as LicenceHistoryResponse,
      filters: {
        showSystemGenerated: 'YES',
      },
    })
    expect(errors).toBeUndefined()
    expect(data.contactCount).toEqual(3)
    expect(data.filters).toEqual({
      dateRange: {
        dateFrom: {},
        dateTo: {},
      },
    })
  })
})
