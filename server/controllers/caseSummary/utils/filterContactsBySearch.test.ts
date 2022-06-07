import { filterContactsBySearch } from './filterContactsSearch'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'

describe('filterContactsBySearch', () => {
  const contactList = [
    {
      code: 'EPOMAT',
      descriptionType: 'Prison Offender Manager - Automatic Transfer',
      contactStartDate: '2022-04-21T10:03:00Z',
      outcome: 'Decision to Recall',
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
    const { contacts } = filterContactsBySearch({
      contacts: contactList,
      filters: {},
    })
    expect(contacts).toEqual(contactList)
  })

  it('filters contacts by the supplied search filter and returns selected filters', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        searchFilter: 'NS',
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
      },
    ])
    expect(selected).toEqual([{ text: 'NS', href: '' }])
  })

  it('matches the search string against notes', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        searchFilter: 'Jane Pavement',
      },
    })
    expect(contacts).toEqual([
      {
        code: 'EPOMAT',
        descriptionType: 'Prison Offender Manager - Automatic Transfer',
        contactStartDate: '2022-04-21T10:03:00Z',
        outcome: 'Decision to Recall',
        notes:
          'Comment added by Jane Pavement on 21/04/2022 at 10:40\nEnforcement Action:  A standard recall is appropriate here because Mr. Edwin has lost his current accommodation as a result of concerns related to drug supply. There are ongoing concerns about his alcohol misuse and poor engagement with probation appointments. A standard recall will allow Mr. Edwin to address his alcohol abuse and consider most appropriate accommodation on release.',
        enforcementAction: null,
        systemGenerated: false,
      },
    ])
    expect(selected).toEqual([{ text: 'Jane Pavement', href: '' }])
  })

  it('matches the search string against outcome', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        searchFilter: 'Failed to Attend',
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
    ])
    expect(selected).toEqual([{ text: 'Failed to Attend', href: '' }])
  })

  it('matches the search string against enforcement action', () => {
    const { contacts, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        searchFilter: 'Enforcement Letter',
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
      },
    ])
    expect(selected).toEqual([{ text: 'Enforcement Letter', href: '' }])
  })

  it('errors if the search filter has less than the minimum number of characters', () => {
    const { contacts, errors, selected } = filterContactsBySearch({
      contacts: contactList,
      filters: {
        searchFilter: 'X',
      },
    })
    expect(contacts).toEqual(contactList)
    expect(errors).toEqual([
      {
        href: '#searchFilter',
        name: 'searchFilter',
        text: 'The search term must be at least two characters long',
      },
    ])
    expect(selected).toBeUndefined()
  })
})
