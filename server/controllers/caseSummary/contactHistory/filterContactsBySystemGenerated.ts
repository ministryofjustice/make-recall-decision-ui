import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import { ContactHistoryFilters } from '../../../@types/contactTypes'
import { FeatureFlags, ObjectMap } from '../../../@types'
import { removeParamsFromQueryString } from '../../../utils/utils'

export const removeSystemGenerated = (contacts: ContactSummaryResponse[]): ContactSummaryResponse[] =>
  contacts.filter((contact: ContactSummaryResponse) => contact.systemGenerated === false)

export const filterContactsBySystemGenerated = ({
  contacts,
  filters,
  featureFlags,
}: {
  contacts: ContactSummaryResponse[]
  filters: ContactHistoryFilters
  featureFlags: FeatureFlags
}): {
  contacts: ContactSummaryResponse[]
  selected?: { text: string; href: string }[]
} => {
  const includeSystemGeneratedContacts = filters.includeSystemGenerated === 'YES'
  const filteredContacts =
    featureFlags.flagShowSystemGenerated && includeSystemGeneratedContacts ? contacts : removeSystemGenerated(contacts)
  const selected = includeSystemGeneratedContacts
    ? [
        {
          text: 'NDelius automatic contacts',
          href: removeParamsFromQueryString({
            paramsToRemove: [{ key: 'includeSystemGenerated', value: 'YES' }],
            allParams: filters as unknown as ObjectMap<string | string[]>,
          }),
        },
      ]
    : undefined
  return {
    contacts: filteredContacts,
    selected,
  }
}
