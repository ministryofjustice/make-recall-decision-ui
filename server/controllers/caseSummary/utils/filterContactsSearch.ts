import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import { removeParamsFromQueryString } from '../../../utils/utils'
import { NamedFormError, ObjectMap } from '../../../@types'
import { formatValidationErrorMessage, makeErrorObject } from '../../../utils/errors'

const MINIMUM_SEARCH_TERM_LENGTH = 2

export const filterContactsBySearch = ({
  contacts,
  filters,
}: {
  contacts: ContactSummaryResponse[]
  filters: ObjectMap<string | string[]>
}): {
  contacts: ContactSummaryResponse[]
  errors?: NamedFormError[]
  selected?: { text: string; href: string }[]
} => {
  const { searchFilter } = filters
  const selectedFilters = Array.isArray(searchFilter) ? searchFilter : [searchFilter]
  let filteredContacts = contacts
  let selected
  let errors
  if (searchFilter) {
    if (searchFilter.length < MINIMUM_SEARCH_TERM_LENGTH) {
      errors = [
        makeErrorObject({
          id: 'searchFilter',
          text: formatValidationErrorMessage({ errorId: 'minLengthSearchContactsTerm' }),
        }),
      ]
    } else {
      const pattern = new RegExp(`.*\\b${searchFilter}.*`, 'i')
      filteredContacts = contacts.filter(contact => {
        const matchedNotes = pattern.test(contact.notes)
        const matchedDescription = pattern.test(contact.descriptionType)
        const matchedOutcome = pattern.test(contact.outcome)
        const matchedEnforcementAction = pattern.test(contact.enforcementAction)
        return matchedNotes || matchedDescription || matchedOutcome || matchedEnforcementAction
      })
      selected = selectedFilters.map(searchTerm => ({
        text: searchTerm,
        href: removeParamsFromQueryString({
          paramsToRemove: [{ key: 'searchFilter', value: searchTerm }],
          allParams: filters,
        }),
      }))
    }
  }
  return {
    contacts: filteredContacts,
    errors,
    selected,
  }
}
