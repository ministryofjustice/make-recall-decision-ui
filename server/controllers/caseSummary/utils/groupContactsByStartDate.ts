import { DateTime } from 'luxon'
import { europeLondon, sortListByDateField } from '../../../utils/dates'
import { LicenceHistoryResponse } from '../../../@types/make-recall-decision-api/models/LicenceHistoryResponse'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api/models/ContactSummaryResponse'
import { groupListByValue } from '../../../utils/utils'

export const groupContactsByStartDate = (contacts: ContactSummaryResponse[]) => {
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

export const transformLicenceHistory = (caseSummary: LicenceHistoryResponse, showSystemGenerated: boolean) => {
  const filtered = showSystemGenerated
    ? caseSummary.contactSummary
    : caseSummary.contactSummary.filter((contact: ContactSummaryResponse) => contact.systemGenerated === false)
  return {
    ...caseSummary,
    contactSummary: groupContactsByStartDate(filtered),
  }
}
