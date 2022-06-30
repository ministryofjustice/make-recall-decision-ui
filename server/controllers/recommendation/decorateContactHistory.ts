import { ContactSummaryResponse } from '../../@types/make-recall-decision-api'
import { SelectableItem } from '../../@types'
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
    added: Boolean(
      evidence && Array.isArray(evidence.contacts) && evidence.contacts.find((c: SelectableItem) => c.id === idx)
    ),
  }))
}
