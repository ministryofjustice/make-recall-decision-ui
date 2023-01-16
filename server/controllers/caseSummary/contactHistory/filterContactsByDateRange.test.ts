import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { filterContactsByDateRange } from './filterContactsByDateRange'

describe('filterContactsByDateRange', () => {
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
      filters,
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
        ...filters,
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
      },
    })
    expect(errors).toEqual([
      { href: '#dateFrom-day', name: 'dateFrom', text: 'Enter the from date', errorId: 'blankDateTime' },
    ])
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
        ...filters,
        'dateFrom-day': '21',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
      },
    })
    expect(errors).toEqual([
      { href: '#dateTo-day', name: 'dateTo', text: 'Enter the to date', errorId: 'blankDateTime' },
    ])
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
        ...filters,
        'dateFrom-day': '22',
        'dateFrom-month': '04',
        'dateFrom-year': '2022',
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
      },
    })
    expect(errors).toEqual([
      {
        href: '#dateFrom-day',
        name: 'dateFrom',
        text: 'The from date must be on or before the to date',
        errorId: 'fromDateAfterToDate',
      },
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
        ...filters,
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
        errorId: 'outOfRangeValueDateParts',
      },
      {
        href: '#dateTo-month',
        name: 'dateTo',
        text: 'The to date must have a real month',
        values: undefined,
        errorId: 'outOfRangeValueDateParts',
      },
    ])
    expect(contacts).toEqual(contactList)
  })

  it('filters contacts by the supplied from and to dates and returns selected filters', () => {
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
    const { errors, contacts, selected } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        ...filters,
        'dateFrom-day': '03',
        'dateFrom-month': '04',
        'dateFrom-year': '2021',
        'dateTo-day': '21',
        'dateTo-month': '04',
        'dateTo-year': '2022',
        contactTypes: 'IVSP',
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
    // this will be used to make a 'remove date filter' link, which should remove the date params
    // but preserve any other existing params, in this case 'contactTypes'
    expect(selected).toEqual([{ text: '3 Apr 2021 to 21 Apr 2022', href: '?contactTypes=IVSP' }])
  })

  it('adjusts a contact start date for DST so it falls inside the start of the date range', () => {
    const contactList = [
      {
        contactStartDate: '2018-07-09T23:00:00Z',
        descriptionType: 'Prison Offender Manager - Automatic Transfer',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        ...filters,
        'dateFrom-day': '10',
        'dateFrom-month': '07',
        'dateFrom-year': '2018',
        'dateTo-day': '11',
        'dateTo-month': '07',
        'dateTo-year': '2018',
      },
    })
    expect(errors).toBeUndefined()
    expect(contacts).toEqual(contactList)
  })

  it('adjusts a contact start date for DST so it falls outside the end of the date range', () => {
    const contactList = [
      {
        contactStartDate: '2018-07-09T23:00:00Z',
        descriptionType: 'Prison Offender Manager - Automatic Transfer',
      },
    ] as ContactSummaryResponse[]
    const { errors, contacts } = filterContactsByDateRange({
      contacts: contactList,
      filters: {
        ...filters,
        'dateFrom-day': '09',
        'dateFrom-month': '07',
        'dateFrom-year': '2018',
        'dateTo-day': '09',
        'dateTo-month': '07',
        'dateTo-year': '2018',
      },
    })
    expect(errors).toBeUndefined()
    expect(contacts).toEqual([])
  })
})
