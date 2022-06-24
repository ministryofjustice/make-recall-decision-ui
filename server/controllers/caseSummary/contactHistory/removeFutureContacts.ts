import { DateTime } from 'luxon'
import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'

export const removeFutureContacts = (contacts: ContactSummaryResponse[]) => {
  return contacts.filter(contact => {
    const now = DateTime.now()
    return DateTime.fromISO(contact.contactStartDate) <= now
  })
}
