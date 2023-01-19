import { removeParamsFromQueryString } from '../../../../utils/utils'
import { ContactHistoryFilters, ContactTypeDecorated } from '../../../../@types/contacts'

// details of applied filters, to be shown as 'tags' at the top of the filters panel; the user can click on a tag to remove the filter
export const decorateSelectedFilters = ({
  selectedContactTypes,
  allContactTypes,
  filters,
}: {
  allContactTypes: ContactTypeDecorated[]
  selectedContactTypes?: string[]
  filters: ContactHistoryFilters
}) =>
  selectedContactTypes
    ? selectedContactTypes
        .map(id => {
          const firstContactMatched = allContactTypes.find(type => type.code === id)
          if (!firstContactMatched) {
            return undefined
          }
          const { description, systemGenerated } = firstContactMatched
          return {
            text: description,
            href: removeParamsFromQueryString({
              paramsToRemove: [{ key: systemGenerated ? 'contactTypesSystemGenerated' : 'contactTypes', value: id }],
              allParams: filters as unknown as Record<string, string | string[]>,
            }),
          }
        })
        .filter(Boolean)
    : []
