import { transformContactHistory } from './transformContactHistory'
import { ContactHistoryResponse } from '../../../@types/make-recall-decision-api/models/ContactHistoryResponse'

describe('transformContactHistory', () => {
  const defaultFilters = {
    'dateFrom-day': '',
    'dateFrom-month': '',
    'dateFrom-year': '',
    'dateTo-day': '',
    'dateTo-month': '',
    'dateTo-year': '',
    contactTypes: '',
    searchFilters: '',
    includeSystemGenerated: 'YES',
  }
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
  const contactTypeGroups = [
    {
      groupId: '1',
      label: 'Accredited programme',
      contactTypeCodes: ['IVSP'],
    },
    {
      groupId: '2',
      label: 'Appointments',
      contactTypeCodes: ['EPOMAT', 'ROC'],
    },
  ]

  it('combines all filters', () => {
    const { errors, data } = transformContactHistory({
      caseSummary: { contactSummary, contactTypeGroups } as ContactHistoryResponse,
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
        // 1 of those 2 contacts has this contact type
        contactTypes: '',
        contactTypesSystemGenerated: 'IVSP',
        includeSystemGenerated: 'YES',
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
                allTermsMatched: true,
                notesMatched: false,
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
        contactTypeGroups: [
          {
            contactCountInGroup: 1,
            contactTypeCodes: [],
            contactTypeCodesSystemGenerated: [
              {
                attributes: {
                  'data-group': 'Accredited programme',
                  'data-type': 'Arrest attempt',
                },
                count: 1,
                description: 'Arrest attempt',
                html: "Arrest attempt <span class='text-secondary'>(<span data-qa='contact-count'>1<span class='govuk-visually-hidden'> contact</span></span>)</span>",
                value: 'IVSP',
                systemGenerated: true,
              },
            ],
            groupId: '1',
            isGroupOpen: true,
            label: 'Accredited programme',
          },
          {
            contactCountInGroup: 1,
            contactTypeCodes: [],
            contactTypeCodesSystemGenerated: [
              {
                attributes: {
                  'data-group': 'Appointments',
                  'data-type': 'Responsible officer change',
                },
                count: 1,
                description: 'Responsible officer change',
                html: "Responsible officer change <span class='text-secondary'>(<span data-qa='contact-count'>1<span class='govuk-visually-hidden'> contact</span></span>)</span>",
                value: 'ROC',
                systemGenerated: true,
              },
            ],
            groupId: '2',
            isGroupOpen: false,
            label: 'Appointments',
          },
        ],
        selected: [
          {
            href: '?dateFrom-day=21&dateFrom-month=04&dateFrom-year=2022&dateTo-day=21&dateTo-month=04&dateTo-year=2022&searchFilters=Arrest%20attempt&includeSystemGenerated=YES',
            text: 'Arrest attempt',
          },
        ],
        selectedIds: ['IVSP'],
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
            href: '?searchFilters=Arrest%20attempt&contactTypesSystemGenerated=IVSP&includeSystemGenerated=YES',
            text: '21 Apr 2022 to 21 Apr 2022',
          },
        ],
      },
      includeSystemGenerated: {
        selected: [
          {
            href: '?dateFrom-day=21&dateFrom-month=04&dateFrom-year=2022&dateTo-day=21&dateTo-month=04&dateTo-year=2022&searchFilters=Arrest%20attempt&contactTypesSystemGenerated=IVSP',
            text: 'NDelius automatic contacts',
          },
        ],
        value: 'YES',
      },
      searchFilters: {
        selected: [
          {
            href: '?dateFrom-day=21&dateFrom-month=04&dateFrom-year=2022&dateTo-day=21&dateTo-month=04&dateTo-year=2022&contactTypesSystemGenerated=IVSP&includeSystemGenerated=YES',
            text: 'Arrest attempt',
          },
        ],
        value: 'Arrest attempt',
      },
    })
  })

  it('returns all contacts if system generated contacts included and no other filters set', () => {
    const { errors, data } = transformContactHistory({
      caseSummary: { contactSummary, contactTypeGroups } as ContactHistoryResponse,
      filters: defaultFilters,
    })
    expect(errors).toBeUndefined()
    expect(data.contactCount).toEqual(4)
    expect(data.hasActiveFilters).toEqual(true)
    expect(data.filters.contactTypes.contactTypeGroups).toEqual([
      {
        contactCountInGroup: 3,
        contactTypeCodes: [],
        contactTypeCodesSystemGenerated: [
          {
            attributes: {
              'data-group': 'Accredited programme',
              'data-type': 'Planned Office Visit (NS)',
            },
            count: 3,
            description: 'Planned Office Visit (NS)',
            html: "Planned Office Visit (NS) <span class='text-secondary'>(<span data-qa='contact-count'>3<span class='govuk-visually-hidden'> contacts</span></span>)</span>",
            value: 'IVSP',
            systemGenerated: true,
          },
        ],
        groupId: '1',
        isGroupOpen: false,
        label: 'Accredited programme',
      },
      {
        contactCountInGroup: 1,
        contactTypeCodes: [],
        contactTypeCodesSystemGenerated: [
          {
            attributes: {
              'data-group': 'Appointments',
              'data-type': 'Responsible officer change',
            },
            count: 1,
            description: 'Responsible officer change',
            html: "Responsible officer change <span class='text-secondary'>(<span data-qa='contact-count'>1<span class='govuk-visually-hidden'> contact</span></span>)</span>",
            value: 'ROC',
            systemGenerated: true,
          },
        ],
        groupId: '2',
        isGroupOpen: false,
        label: 'Appointments',
      },
    ])
  })

  it('combines the errors from different filters', () => {
    const { errors } = transformContactHistory({
      caseSummary: { contactSummary, contactTypeGroups } as ContactHistoryResponse,
      filters: {
        ...defaultFilters,
        'dateFrom-day': '21',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
        searchFilters: 'A',
      },
    })
    expect(errors).toEqual([
      { href: '#dateTo-day', name: 'dateTo', text: 'Enter the to date', errorId: 'blankDateTime' },
      {
        href: '#searchFilters',
        name: 'searchFilters',
        text: 'Search term must be 2 characters or more',
        values: 'A',
        errorId: 'minLengthSearchContactsTerm',
      },
    ])
  })

  it('sets hasActiveFilters property if search filter is successful', () => {
    const { errors, data } = transformContactHistory({
      caseSummary: { contactSummary, contactTypeGroups } as ContactHistoryResponse,
      filters: {
        ...defaultFilters,
        searchFilters: 'Serata Street',
      },
    })
    expect(errors).toBeUndefined()
    expect(data.contactCount).toEqual(1)
    expect(data.hasActiveFilters).toEqual(true)
  })

  it('shows system contacts if flag is on and filter set', () => {
    const { data } = transformContactHistory({
      caseSummary: { contactSummary, contactTypeGroups } as ContactHistoryResponse,
      filters: { ...defaultFilters, includeSystemGenerated: 'YES' },
    })
    expect(data.contactCount).toEqual(4)
  })

  it('hides system contacts if filter not set', () => {
    const { data } = transformContactHistory({
      caseSummary: { contactSummary, contactTypeGroups } as ContactHistoryResponse,
      filters: { ...defaultFilters, includeSystemGenerated: '' },
    })
    expect(data.contactCount).toEqual(1)
  })

  it('marks system-generated contact types', () => {
    const contacts = [
      {
        code: 'ABC',
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Arrest attempt',
        systemGenerated: false,
      },
      {
        code: 'DEF',
        contactStartDate: '2022-04-21T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
        systemGenerated: true,
      },
      {
        code: 'ROC',
        contactStartDate: '2022-04-21T11:30:00Z',
        descriptionType: 'Responsible officer change',
        systemGenerated: true,
      },
      {
        code: 'IVSP',
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Management Oversight - Recall',
        systemGenerated: true,
      },
    ]
    const groups = [
      {
        groupId: '1',
        label: 'Accredited programme',
        contactTypeCodes: ['IVSP', 'ABC', 'DEF', 'ROC'],
      },
    ]
    const { errors, data } = transformContactHistory({
      caseSummary: { contactSummary: contacts, contactTypeGroups: groups } as ContactHistoryResponse,
      filters: { ...defaultFilters, includeSystemGenerated: 'YES' },
    })
    expect(errors).toBeUndefined()
    expect(data.contactCount).toEqual(4)
    expect(data.hasActiveFilters).toEqual(true)
    expect(data.filters.contactTypes.contactTypeGroups[0].contactTypeCodes).toHaveLength(1)
    expect(data.filters.contactTypes.contactTypeGroups[0].contactTypeCodes[0]).toEqual(
      expect.objectContaining({
        value: 'ABC',
        description: 'Arrest attempt',
        systemGenerated: false,
      })
    )
    expect(data.filters.contactTypes.contactTypeGroups[0].contactTypeCodesSystemGenerated).toHaveLength(3)
    const [first, second, third] = data.filters.contactTypes.contactTypeGroups[0].contactTypeCodesSystemGenerated
    expect(first).toEqual(
      expect.objectContaining({
        value: 'IVSP',
        description: 'Management Oversight - Recall',
        systemGenerated: true,
      })
    )
    expect(second).toEqual(
      expect.objectContaining({
        value: 'DEF',
        description: 'Planned Office Visit (NS)',
        systemGenerated: true,
      })
    )
    expect(third).toEqual(
      expect.objectContaining({
        value: 'ROC',
        description: 'Responsible officer change',
        systemGenerated: true,
      })
    )
  })
})
