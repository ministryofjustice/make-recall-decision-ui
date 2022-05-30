import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { filterContactsByContactType } from './filterContactsByContactType'

describe('filterContactsByContactType', () => {
  const contactList = [
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

  it('leaves the list unaltered if no contact types filter supplied', () => {
    const { contacts } = filterContactsByContactType({
      contacts: contactList,
      filters: {},
    })
    expect(contacts).toEqual(contactList)
  })

  it('filters contacts by the supplied contact types filter and returns selected filters', () => {
    const { contacts, selected } = filterContactsByContactType({
      contacts: contactList,
      filters: {
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
    expect(selected).toEqual([{ text: 'IOM 3rd Party Office Visit', href: '' }])
  })
})
