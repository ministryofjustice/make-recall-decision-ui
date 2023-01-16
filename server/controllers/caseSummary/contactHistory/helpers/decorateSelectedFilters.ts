import { removeParamsFromQueryString } from '../../../../utils/utils'
import { ContactHistoryFilters } from '../../../../@types/contactTypes'
import { ObjectMap } from '../../../../@types'

// details of applied filters, to be shown as 'tags' at the top of the filters panel; the user can click on a tag to remove the filter
export const decorateSelectedFilters = ({
  selectedContactTypes,
  allContactTypes,
  filters,
}: {
  allContactTypes: { code: string; count: number; description: string }[]
  selectedContactTypes?: string[]
  filters: ContactHistoryFilters
}) =>
  selectedContactTypes
    ? selectedContactTypes.map(id => ({
        text: allContactTypes.find(type => type.code === id)?.description,
        href: removeParamsFromQueryString({
          paramsToRemove: [{ key: 'contactTypes', value: id }],
          allParams: filters as unknown as ObjectMap<string | string[]>,
        }),
      }))
    : []
