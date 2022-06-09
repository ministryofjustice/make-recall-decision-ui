import { transformContactHistory } from './transformContactHistory'
import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'

describe('transformContactHistory', () => {
  const contactSummary = [
    {
      code: 'IVSP',
      contactStartDate: '2022-05-04T13:07:00Z',
      descriptionType: 'Management Oversight - Recall',
      outcome: null,
      notes:
        'Good afternoon, the police attempted to arrest Mr. Edwin at 18 Serata Street today, they forced entry but he was not present. We have a contractor repairing the door and changing the locks so that Mr. Edwin will not be able to return. Kind regards, PC Street',
      enforcementAction: null,
      systemGenerated: true,
    },
    {
      code: 'IVSP',
      contactStartDate: '2022-04-21T10:03:00Z',
      descriptionType: 'Arrest attempt',
      outcome: 'Decision to Recall',
      notes:
        'Comment added by Jane Pavement on 21/04/2022 at 10:40\nEnforcement Action:  A standard recall is appropriate here because Mr. Edwin has lost his current accommodation as a result of concerns related to drug supply. There are ongoing concerns about his alcohol misuse and poor engagement with probation appointments. A standard recall will allow Mr. Edwin to address his alcohol abuse and consider most appropriate accommodation on release.',
      enforcementAction: null,
      systemGenerated: false,
    },
    {
      code: 'IVSP',
      contactStartDate: '2022-04-21T11:30:00Z',
      descriptionType: 'Planned Office Visit (NS)',
      outcome: 'Failed to Attend',
      notes: 'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
      enforcementAction: 'Decision Pending Response from Person on Probation',
      systemGenerated: true,
    },
    {
      code: 'ROC',
      contactStartDate: '2022-04-21T11:30:00Z',
      descriptionType: 'Responsible officer change',
      outcome: null,
      notes: 'New officer made an arrest attempt',
      enforcementAction: null,
      systemGenerated: true,
    },
  ]

  it('combines all filters', () => {
    const { errors, data } = transformContactHistory({
      caseSummary: { contactSummary } as LicenceHistoryResponse,
      filters: {
        // this date range will reduce the result set to 3 contacts
        'dateFrom-day': '21',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
        // 2 of those 3 remaining contacts have this search string in their text fields
        searchFilters: 'Arrest attempt',
        // 1 of thooe 2 contacts has this contact type
        contactTypes: 'IVSP',
      },
    })
    expect(errors).toBeUndefined()
    expect(data.contactCount).toEqual(1)
    // the list of contacts, grouped by start date
    expect(data.contactSummary).toEqual({
      groupedByKey: 'startDate',
      items: [
        {
          groupValue: '2022-04-21',
          items: [
            {
              code: 'IVSP',
              contactStartDate: '2022-04-21T10:03:00Z',
              descriptionType: 'Arrest attempt',
              enforcementAction: null,
              notes:
                'Comment added by Jane Pavement on 21/04/2022 at 10:40\nEnforcement Action:  A standard recall is appropriate here because Mr. Edwin has lost his current accommodation as a result of concerns related to drug supply. There are ongoing concerns about his alcohol misuse and poor engagement with probation appointments. A standard recall will allow Mr. Edwin to address his alcohol abuse and consider most appropriate accommodation on release.',
              outcome: 'Decision to Recall',
              startDate: '2022-04-21',
              systemGenerated: false,
              searchTextMatch: {
                description: true,
                enforcementAction: false,
                notes: false,
                outcome: false,
              },
            },
          ],
        },
      ],
    })
    expect(data.hasActiveFilters).toEqual(true)
    // details about the active filters
    expect(data.filters).toEqual({
      contactTypes: {
        allContactTypes: [
          {
            count: 1,
            description: 'IOM 3rd Party Office Visit',
            html: 'IOM 3rd Party Office Visit <span class="text-secondary">(<span data-qa=\'contact-count\'>1</span>)</span>',
            value: 'IVSP',
          },
          {
            count: 1,
            description: 'Responsible Officer Change',
            html: 'Responsible Officer Change <span class="text-secondary">(<span data-qa=\'contact-count\'>1</span>)</span>',
            value: 'ROC',
          },
        ],
        selected: [
          {
            href: '?dateFrom-day=21&dateFrom-month=04&dateFrom-year=2022&dateTo-day=21&dateTo-month=04&dateTo-year=2022&searchFilters=Arrest%20attempt',
            text: 'IOM 3rd Party Office Visit',
          },
        ],
        selectedIds: 'IVSP',
      },
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
        selected: [
          {
            href: '?searchFilters=Arrest%20attempt&contactTypes=IVSP',
            text: '21 Apr 2022 to 21 Apr 2022',
          },
        ],
      },
      searchFilters: {
        selected: [
          {
            href: '?dateFrom-day=21&dateFrom-month=04&dateFrom-year=2022&dateTo-day=21&dateTo-month=04&dateTo-year=2022&contactTypes=IVSP',
            text: 'Arrest attempt',
          },
        ],
        value: 'Arrest attempt',
      },
    })
  })

  it('returns all contacts if no filters', () => {
    const { errors, data } = transformContactHistory({
      caseSummary: { contactSummary } as LicenceHistoryResponse,
      filters: {},
    })
    expect(errors).toBeUndefined()
    expect(data.contactCount).toEqual(4)
    expect(data.hasActiveFilters).toEqual(false)
    expect(data.filters).toEqual({
      contactTypes: {
        allContactTypes: [
          {
            count: 3,
            description: 'IOM 3rd Party Office Visit',
            html: 'IOM 3rd Party Office Visit <span class="text-secondary">(<span data-qa=\'contact-count\'>3</span>)</span>',
            value: 'IVSP',
          },
          {
            count: 1,
            description: 'Responsible Officer Change',
            html: 'Responsible Officer Change <span class="text-secondary">(<span data-qa=\'contact-count\'>1</span>)</span>',
            value: 'ROC',
          },
        ],
        selected: [],
      },
      dateRange: {
        dateFrom: {},
        dateTo: {},
      },
      searchFilters: {},
    })
  })

  it('combines the errors from different filters', () => {
    const { errors } = transformContactHistory({
      caseSummary: { contactSummary } as LicenceHistoryResponse,
      filters: {
        'dateFrom-day': '21',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
        searchFilters: 'A',
      },
    })
    expect(errors).toEqual([
      { href: '#dateTo-day', name: 'dateTo', text: 'Enter the to date' },
      {
        href: '#searchFilters',
        name: 'searchFilters',
        text: 'The search term must be at least two characters long',
        values: 'A',
      },
    ])
  })

  it('sets hasActiveFilters flag if search filter is successful', () => {
    const { errors, data } = transformContactHistory({
      caseSummary: { contactSummary } as LicenceHistoryResponse,
      filters: {
        searchFilters: 'Serata Street',
      },
    })
    expect(errors).toBeUndefined()
    expect(data.contactCount).toEqual(1)
    expect(data.hasActiveFilters).toEqual(true)
  })
})
