import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import { ContactHistoryFilters } from '../../../@types/contacts'

import { removeParamsFromQueryString } from '../../../utils/utils'

export const removeSystemGenerated = (contacts: ContactSummaryResponse[]): ContactSummaryResponse[] =>
  contacts.filter((contact: ContactSummaryResponse) => contact.systemGenerated === false)

export const filterContactsBySystemGenerated = ({
  contacts,
  filters,
}: {
  contacts: ContactSummaryResponse[]
  filters: ContactHistoryFilters
}): {
  contacts: ContactSummaryResponse[]
  selected?: { text: string; href: string }[]
} => {
  const includeSystemGeneratedContacts = filters.includeSystemGenerated === 'YES'
  const filteredContacts = includeSystemGeneratedContacts ? contacts : removeSystemGenerated(contacts)
  const selected = includeSystemGeneratedContacts
    ? [
        {
          text: 'NDelius automatic contacts',
          href: removeParamsFromQueryString({
            paramsToRemove: [{ key: 'includeSystemGenerated', value: 'YES' }],
            allParams: filters as unknown as Record<string, string | string[]>,
          }),
        },
      ]
    : undefined
  return {
    contacts: filteredContacts,
    selected,
  }
}
