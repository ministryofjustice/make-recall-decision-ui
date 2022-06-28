import { getValue } from '../../data/fetchFromCacheOrApi'
import { ContactSummaryResponse } from '../../@types/make-recall-decision-api'
import { SelectableContact } from '../../@types'

export const selectContactHistoryDecorations = async ({
  contacts,
  crn,
}: {
  contacts: ContactSummaryResponse[]
  crn: string
}) => {
  const evidence = await getValue(`evidence:${crn}`)
  return contacts.map((contact, idx) => ({
    ...contact,
    id: idx,
    added: Boolean(evidence && evidence.contacts.find((c: SelectableContact) => c.id === idx)),
  }))
}
