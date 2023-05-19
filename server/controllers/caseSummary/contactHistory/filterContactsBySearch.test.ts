import { filterContactsBySearch } from './filterContactsBySearch'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'

describe('filterContactsBySearch', () => {
  const defaultFilters = {
    'dateFrom-day': '',
    'dateFrom-month': '',
    'dateFrom-year': '',
    'dateTo-day': '',
    'dateTo-month': '',
    'dateTo-year': '',
    contactTypes: '',
    searchFilters: '',
    includeSystemGenerated: '',
  }
  const contactList = [
    {
      code: 'EPOMAT',
      descriptionType: 'Prison Offender Manager - Automatic Transfer',
      contactStartDate: '2022-04-21T10:03:00Z',
      outcome: 'Decision to Recall',
      description: 'Contact description',
      notes:
        'Comment added by Jane Pavement on 21/04/2022 at 10:40\nEnforcement Action:  A standard recall is appropriate here because Mr. Edwin has lost his current accommodation as a result of concerns related to drug supply. There are ongoing concerns about his alcohol misuse and poor engagement with probation appointments. A standard recall will allow Mr. Edwin to address his alcohol abuse and consider most appropriate accommodation on release.',
      enforcementAction: null,
      systemGenerated: false,
    },
    {
      code: 'ROC',
      descriptionType: 'Responsible Officer Change',
      contactStartDate: '2022-04-21T11:30:00Z',
      outcome: 'Failed to Attend',
      description: 'Description of the incident',
      notes: 'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
      enforcementAction: 'Decision Pending Response from Person on Probation',
      systemGenerated: false,
    },
    {
      code: 'IVSP',
      descriptionType: 'Planned Office Visit (NS)',
      contactStartDate: '2022-04-13T11:30:00Z',
      outcome: 'Failed to Attend',
      notes: 'Comment added by Eliot Prufrock on 13/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
      enforcementAction: 'Second Enforcement Letter Sent',
      systemGenerated: false,
    },
  ] as ContactSummaryResponse[]

  it('leaves the list unaltered if no search filter supplied', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: defaultFilters,
    })
    expect(contacts).toEqual(contactList)
    expect(selected).toBeUndefined()
  })

  it('strips out script tags and their contents from search terms', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: '<script></script>NS',
      },
    })
    expect(contacts).toHaveLength(1)
    expect(selected).toEqual([{ text: 'NS', href: '' }])
  })

  it('filters contacts by the supplied search filter and returns selected filters', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: 'NS',
      },
    })
    expect(contacts).toEqual([
      {
        code: 'IVSP',
        descriptionType: 'Planned Office Visit (NS)',
        contactStartDate: '2022-04-13T11:30:00Z',
        outcome: 'Failed to Attend',
        notes: 'Comment added by Eliot Prufrock on 13/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
        enforcementAction: 'Second Enforcement Letter Sent',
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: false,
        },
        startDate: null,
      },
    ])
    expect(selected).toEqual([{ text: 'NS', href: '' }])
  })

  it('filters using a saved search filter', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: ['NS', ''], // one saved search filter, and the empty string is from the search input
      },
    })
    expect(contacts).toEqual([
      {
        code: 'IVSP',
        descriptionType: 'Planned Office Visit (NS)',
        contactStartDate: '2022-04-13T11:30:00Z',
        outcome: 'Failed to Attend',
        notes: 'Comment added by Eliot Prufrock on 13/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
        enforcementAction: 'Second Enforcement Letter Sent',
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: false,
        },
        startDate: null,
      },
    ])
    expect(selected).toEqual([{ text: 'NS', href: '' }])
  })

  it('matches the search string against notes', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: 'Jane Pavement',
      },
    })
    expect(contacts).toEqual([
      {
        code: 'EPOMAT',
        descriptionType: 'Prison Offender Manager - Automatic Transfer',
        contactStartDate: '2022-04-21T10:03:00Z',
        outcome: 'Decision to Recall',
        description: 'Contact description',
        notes:
          'Comment added by Jane Pavement on 21/04/2022 at 10:40\nEnforcement Action:  A standard recall is appropriate here because Mr. Edwin has lost his current accommodation as a result of concerns related to drug supply. There are ongoing concerns about his alcohol misuse and poor engagement with probation appointments. A standard recall will allow Mr. Edwin to address his alcohol abuse and consider most appropriate accommodation on release.',
        enforcementAction: null,
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: true,
        },
        startDate: null,
      },
    ])
    expect(selected).toEqual([{ text: 'Jane Pavement', href: '' }])
  })

  it('matches the search string against description', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: 'Description of the incident',
      },
    })
    expect(contacts).toEqual([
      {
        code: 'ROC',
        descriptionType: 'Responsible Officer Change',
        contactStartDate: '2022-04-21T11:30:00Z',
        outcome: 'Failed to Attend',
        description: 'Description of the incident',
        notes: 'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
        enforcementAction: 'Decision Pending Response from Person on Probation',
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: false,
        },
        startDate: null,
      },
    ])
    expect(selected).toEqual([{ text: 'Description of the incident', href: '' }])
  })

  it('matches the search string against outcome', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: 'Failed to Attend',
      },
    })
    expect(contacts).toEqual([
      {
        code: 'ROC',
        descriptionType: 'Responsible Officer Change',
        contactStartDate: '2022-04-21T11:30:00Z',
        outcome: 'Failed to Attend',
        description: 'Description of the incident',
        notes: 'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
        enforcementAction: 'Decision Pending Response from Person on Probation',
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: false,
        },
        startDate: null,
      },
      {
        code: 'IVSP',
        descriptionType: 'Planned Office Visit (NS)',
        contactStartDate: '2022-04-13T11:30:00Z',
        outcome: 'Failed to Attend',
        notes: 'Comment added by Eliot Prufrock on 13/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
        enforcementAction: 'Second Enforcement Letter Sent',
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: false,
        },
        startDate: null,
      },
    ])
    expect(selected).toEqual([{ text: 'Failed to Attend', href: '' }])
  })

  it('matches the search string against enforcement action', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: 'Enforcement Letter',
      },
    })
    expect(contacts).toEqual([
      {
        code: 'IVSP',
        descriptionType: 'Planned Office Visit (NS)',
        contactStartDate: '2022-04-13T11:30:00Z',
        outcome: 'Failed to Attend',
        notes: 'Comment added by Eliot Prufrock on 13/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
        enforcementAction: 'Second Enforcement Letter Sent',
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: false,
        },
        startDate: null,
      },
    ])
    expect(selected).toEqual([{ text: 'Enforcement Letter', href: '' }])
  })

  it('errors if the search filter has less than the minimum number of characters', () => {
    const { contacts, errors, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        ...defaultFilters,
        searchFilters: 'X',
      },
    })
    expect(contacts).toEqual(contactList)
    expect(errors).toEqual([
      {
        href: '#searchFilters',
        name: 'searchFilters',
        text: 'Search term must be 2 characters or more',
        values: 'X',
        errorId: 'minLengthSearchContactsTerm',
      },
    ])
    expect(selected).toBeUndefined()
  })

  it('matches a contact if all search filters match against different fields', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: [
        {
          code: 'ROC',
          descriptionType: 'Responsible Officer Change',
          contactStartDate: '2022-04-21T11:30:00Z',
          outcome: 'Failed to Attend',
          notes:
            'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
          enforcementAction: 'Decision Pending Response from Person on Probation',
          systemGenerated: false,
        },
      ],
      filters: {
        ...defaultFilters,
        searchFilters: ['Responsible officer', 'Prufrock'],
      },
    })
    expect(contacts).toEqual([
      {
        code: 'ROC',
        descriptionType: 'Responsible Officer Change',
        contactStartDate: '2022-04-21T11:30:00Z',
        outcome: 'Failed to Attend',
        notes: 'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
        enforcementAction: 'Decision Pending Response from Person on Probation',
        systemGenerated: false,
        searchTextMatch: {
          allTermsMatched: true,
          notesMatched: true,
        },
        startDate: null,
      },
    ])
    expect(selected).toEqual([
      { text: 'Responsible officer', href: '?searchFilters=Prufrock' },
      { text: 'Prufrock', href: '?searchFilters=Responsible%20officer' },
    ])
  })

  it('does not match a contact if not all search filters match against different fields', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: [
        {
          code: 'ROC',
          descriptionType: 'Responsible Officer Change',
          contactStartDate: '2022-04-21T11:30:00Z',
          outcome: 'Failed to Attend',
          notes:
            'Comment added by Eliot Prufrock on 20/04/2022 at 11:35\nEnforcement Action: Refer to Offender Manager',
          enforcementAction: 'Decision Pending Response from Person on Probation',
          systemGenerated: false,
        },
      ],
      filters: {
        ...defaultFilters,
        searchFilters: ['Responsible officer', 'Derby'],
      },
    })
    expect(contacts).toEqual([])
    expect(selected).toEqual([
      { text: 'Responsible officer', href: '?searchFilters=Derby' },
      { text: 'Derby', href: '?searchFilters=Responsible%20officer' },
    ])
  })
})
