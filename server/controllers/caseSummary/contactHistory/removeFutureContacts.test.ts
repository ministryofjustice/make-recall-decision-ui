import { DateTime } from 'luxon'
import { removeFutureContacts } from './removeFutureContacts'

describe('removeFutureContacts', () => {
  const plusOneMinute = DateTime.now().plus({ minute: 1 }).toISO()
  const plusTwoMonths = DateTime.now().plus({ month: 2 }).toISO()
  const contacts = [
    {
      contactStartDate: '2022-05-04T13:07:00Z',
    },
    {
      contactStartDate: plusOneMinute,
    },
    {
      contactStartDate: '2022-05-04T13:07:00Z',
    },
    {
      contactStartDate: plusTwoMonths,
    },
  ]

  it('removes contacts with future dates', () => {
    const result = removeFutureContacts(contacts)
    expect(result).toEqual([
      {
        contactStartDate: '2022-05-04T13:07:00Z',
      },
      {
        contactStartDate: '2022-05-04T13:07:00Z',
      },
    ])
  })
})
