import { DateTime } from 'luxon'
import { ContactSummary } from '../../../@types/make-recall-decision-api/models/ContactSummary'
import { europeLondon, sortListByDateField } from '../../../utils/dates'
import { groupListByValue } from '../../../utils/utils'

export const groupContactsByStartDate = (contacts: ContactSummary[]) => {
  const contactsWithDate = contacts.map(contact => ({
    ...contact,
    startDate: DateTime.fromISO(contact.contactStartDate, { zone: europeLondon }).toISODate(),
  }))
  const sortedByDate = sortListByDateField({
    list: contactsWithDate,
    dateKey: 'contactStartDate',
    newestFirst: true,
  })
  const groupedByDate = groupListByValue({
    list: sortedByDate,
    groupByKey: 'startDate',
  })
  const sortedByGroupDate = sortListByDateField({
    list: groupedByDate.items,
    dateKey: 'groupValue',
    newestFirst: true,
  })
  return { ...groupedByDate, items: sortedByGroupDate }
}
