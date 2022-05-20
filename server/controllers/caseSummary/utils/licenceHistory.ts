import { CaseLicenceHistory } from '../../../@types/make-recall-decision-api/models/CaseLicenceHistory'
import { ContactSummary } from '../../../@types/make-recall-decision-api/models/ContactSummary'
import { sortListByDateField } from '../../../utils/dates'
import { groupListByValue } from '../../../utils/utils'

export const groupContactsByStartDate = (contacts: ContactSummary[]) => {
  const contactsWithDate = contacts.map(contact => ({
    ...contact,
    startDate: contact.contactStartDate.substring(0, 10),
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

export const transformLicenceHistory = (caseSummary: CaseLicenceHistory, showSystemGenerated: boolean) => {
  const filtered = showSystemGenerated
    ? caseSummary.contactSummary
    : caseSummary.contactSummary.filter((contact: ContactSummary) => contact.systemGenerated === false)
  return {
    ...caseSummary,
    contactSummary: groupContactsByStartDate(filtered),
  }
}
