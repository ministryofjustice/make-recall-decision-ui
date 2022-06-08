import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import { removeParamsFromQueryString } from '../../../utils/utils'
import { DecoratedContact, NamedFormError, ObjectMap } from '../../../@types'
import { formatValidationErrorMessage, makeErrorObject } from '../../../utils/errors'

const MINIMUM_SEARCH_TERM_LENGTH = 2

export const filterContactsBySearch = ({
  contacts,
  filters,
}: {
  contacts: ContactSummaryResponse[]
  filters: ObjectMap<string | string[]>
}): {
  contacts: DecoratedContact[]
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
      filteredContacts = contacts
        .map(contact => {
          return {
            ...contact,
            startDate: null,
            searchTextMatch: {
              notes: pattern.test(contact.notes),
              description: pattern.test(contact.descriptionType),
              outcome: pattern.test(contact.outcome),
              enforcementAction: pattern.test(contact.enforcementAction),
            },
          }
        })
        .filter(contact => {
          const { searchTextMatch } = contact
          return (
            searchTextMatch.notes ||
            searchTextMatch.description ||
            searchTextMatch.outcome ||
            searchTextMatch.enforcementAction
          )
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
    contacts: filteredContacts as DecoratedContact[],
    errors,
    selected,
  }
}
