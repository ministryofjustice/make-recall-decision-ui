import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { filterContactsByDateRange } from './filterContactsByDateRange'

describe('filterDates', () => {
  it('leaves the list unaltered if no dates supplied', () => {
    const contactList = [
      {
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
      {
        contactStartDate: '2022-04-21T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts } = filterContactsByDateRange({
      contacts: contactList,
      filters: {},
    })
    expect(errors).toBeUndefined()
    expect(contacts).toEqual(contactList)
  })

  it('leaves the list unaltered and returns an error if from date not entered and to date is entered', () => {
    const contactList = [
      {
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
      {
        contactStartDate: '2022-04-21T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
      },
    })
    expect(errors).toEqual([{ href: '#dateFrom-day', name: 'dateFrom', text: 'Enter the from date' }])
    expect(contacts).toEqual(contactList)
  })

  it('leaves the list unaltered and returns an error if from date is entered and to date not entered', () => {
    const contactList = [
      {
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
      {
        contactStartDate: '2022-04-21T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        'dateFrom-day': '21',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
      },
    })
    expect(errors).toEqual([{ href: '#dateTo-day', name: 'dateTo', text: 'Enter the to date' }])
    expect(contacts).toEqual(contactList)
  })

  it('leaves the list unaltered and returns an error if from date is after to date', () => {
    const contactList = [
      {
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
      {
        contactStartDate: '2022-04-21T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        'dateFrom-day': '22',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
      },
    })
    expect(errors).toEqual([
      { href: '#dateFrom-day', name: 'dateFrom', text: 'The from date must be before the to date' },
    ])
    expect(contacts).toEqual(contactList)
  })

  it('leaves the list unaltered and returns errors if from date and to date are invalid', () => {
    const contactList = [
      {
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
      {
        contactStartDate: '2022-04-21T11:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        'dateFrom-day': '32',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
        'dateTo-day': '21',
        'dateTo-month': '13',
        'dateTo-year': '2022',
      },
    })
    expect(errors).toEqual([
      {
        href: '#dateFrom-day',
        name: 'dateFrom',
        text: 'The from date must have a real day',
        values: undefined,
      },
      {
        href: '#dateTo-month',
        name: 'dateTo',
        text: 'The to date must have a real month',
        values: undefined,
      },
    ])
    expect(contacts).toEqual(contactList)
  })

  it('filters contacts by the supplied from and to dates and returns a label', () => {
    const contactList = [
      {
        contactStartDate: '2022-05-04T13:07:00Z',
        descriptionType: 'Arrest attempt',
      },
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
      {
        contactStartDate: '2022-04-20T23:30:00Z',
        descriptionType: 'Planned Office Visit (NS)',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts, selectedLabel } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        'dateFrom-day': '03',
        'dateFrom-month': '04',
        'dateFrom-year': '2021',
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
      },
    })
    expect(errors).toBeUndefined()
    expect(contacts).toEqual([
      {
        contactStartDate: '2022-04-21T10:03:00Z',
        descriptionType: 'Management Oversight - Recall',
      },
      {
        contactStartDate: '2022-04-20T23:30:00Z', // corrected due to daylight savings, so becomes 21st April
        descriptionType: 'Planned Office Visit (NS)',
      },
    ])
    expect(selectedLabel).toEqual('3 Apr 2021 to 21 Apr 2022')
  })
})
