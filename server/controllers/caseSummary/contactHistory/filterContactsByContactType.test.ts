import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { filterContactsByContactType } from './filterContactsByContactType'

describe('filterContactsByContactType', () => {
  const filteredContacts = [
    {
      code: 'IVSP',
      contactStartDate: '2022-05-04T13:07:00Z',
      descriptionType: 'Arrest attempt',
    },
    {
      code: 'C191',
      contactStartDate: '2022-04-21T10:03:00Z',
      descriptionType: 'Management Oversight - Recall',
    },
    {
      code: 'C002',
      contactStartDate: '2022-04-21T11:30:00Z',
      descriptionType: 'Planned Office Visit (NS)',
    },
  ] as ContactSummaryResponse[]
  const allContacts = [...filteredContacts] as ContactSummaryResponse[]
  const contactTypeGroups = [
    {
      groupId: '1',
      label: 'Accredited programme',
      contactTypeCodes: ['IVSP'],
    },
    {
      groupId: '2',
      label: 'Appointments',
      contactTypeCodes: ['C191', 'C002'],
    },
  ]
  const filters = {
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

  it('leaves the list unaltered if no contact types filter supplied', () => {
    const { contacts } = filterContactsByContactType({
      filteredContacts,
      allContacts,
      contactTypeGroups,
      filters,
    })
    expect(contacts).toEqual(filteredContacts)
  })

  it('filters contacts by the supplied contact types filter and returns selected filters', () => {
    const { contacts, selected } = filterContactsByContactType({
      filteredContacts,
      allContacts,
      contactTypeGroups,
      filters: {
        ...filters,
        contactTypes: 'IVSP',
      },
    })
    expect(contacts).toEqual([
      {
        code: 'IVSP',
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
    ])
    // this will be used to make a 'remove contact type' link
    expect(selected).toEqual([{ text: 'Arrest attempt', href: '' }])
  })
})
