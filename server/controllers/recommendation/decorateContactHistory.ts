import { ContactSummaryResponse } from '../../@types/make-recall-decision-api'
import { SelectableContact } from '../../@types'
import { getRecommendation } from './utils/persistedRecommendation'

export const selectContactHistoryDecorations = async ({
  contacts,
  crn,
}: {
  contacts: ContactSummaryResponse[]
  crn: string
}) => {
  const evidence = await getRecommendation(crn)
  return contacts.map((contact, idx) => ({
    ...contact,
    id: idx,
    added: Boolean(evidence && evidence.contacts.find((c: SelectableContact) => c.id === idx)),
  }))
}
