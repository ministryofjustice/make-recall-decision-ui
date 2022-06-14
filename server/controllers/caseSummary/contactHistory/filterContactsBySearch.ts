import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import { isDefined, removeParamsFromQueryString } from '../../../utils/utils'
import { ContactHistoryFilters, DecoratedContact, NamedFormError, ObjectMap } from '../../../@types'
import { formatValidationErrorMessage, makeErrorObject } from '../../../utils/errors'

const MINIMUM_SEARCH_TERM_LENGTH = 2

export const filterContactsBySearch = ({
  contacts,
  filters,
}: {
  contacts: ContactSummaryResponse[]
  filters: ContactHistoryFilters
}): {
  contacts: DecoratedContact[]
  errors?: NamedFormError[]
  selected?: { text: string; href: string }[]
} => {
  const { searchFilters } = filters
  let filteredContacts = contacts
  let selected
  let errors
  if (isDefined(searchFilters) && searchFilters !== '') {
    let selectedFilters = Array.isArray(searchFilters) ? searchFilters : [searchFilters]
    selectedFilters = selectedFilters.filter(term => term !== '')
    const invalidLength = selectedFilters.find(filter => filter.length < MINIMUM_SEARCH_TERM_LENGTH)
    if (invalidLength) {
      errors = [
        makeErrorObject({
          id: 'searchFilters',
          text: formatValidationErrorMessage({ errorId: 'minLengthSearchContactsTerm' }),
          values: invalidLength,
        }),
      ]
    } else {
      const patterns = selectedFilters.map(filter => new RegExp(`.*\\b${filter}.*`, 'i'))
      filteredContacts = contacts
        .map(contact => {
          return {
            ...contact,
            startDate: null,
            searchTextMatch: {
              notes: patterns.every(pattern => pattern.test(contact.notes)),
              description: patterns.every(pattern => pattern.test(contact.descriptionType)),
              outcome: patterns.every(pattern => pattern.test(contact.outcome)),
              enforcementAction: patterns.every(pattern => pattern.test(contact.enforcementAction)),
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
          paramsToRemove: [{ key: 'searchFilters', value: searchTerm }],
          allParams: filters as unknown as ObjectMap<string | string[]>,
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
