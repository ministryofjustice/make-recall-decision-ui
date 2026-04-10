import { ContactHistoryFilters } from '../../../../@types/contacts'
import { wrapValueInArray } from '../../../../utils/utils'

// from the contact types that the user selected, make a single array of codes
const listSelectedContactTypeCodes = ({ filters }: { filters: ContactHistoryFilters }) => {
  const { contactTypes, contactTypesSystemGenerated } = filters
  let aggregated: string[]
  if (contactTypes) {
    aggregated = wrapValueInArray(contactTypes)
  }
  if (contactTypesSystemGenerated && filters.includeSystemGenerated === 'YES') {
    aggregated = [...(aggregated || []), ...wrapValueInArray(contactTypesSystemGenerated)]
  }
  return aggregated
}

export default listSelectedContactTypeCodes
