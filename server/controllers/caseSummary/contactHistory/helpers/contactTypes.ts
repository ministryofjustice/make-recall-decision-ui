import { ContactTypeDecorated, ContactHistoryFilters, ObjectMap } from '../../../../@types'
import { isDefined, removeParamsFromQueryString } from '../../../../utils/utils'
import { ContactGroupResponse } from '../../../../@types/make-recall-decision-api/models/ContactGroupResponse'
import { ContactSummaryResponse } from '../../../../@types/make-recall-decision-api'
import logger from '../../../../../logger'

export const parseSelectedFilters = ({ filters }: { filters: ContactHistoryFilters }) => {
  const { contactTypes } = filters
  if (!isDefined(contactTypes) || contactTypes === '') {
    return undefined
  }
  return Array.isArray(contactTypes) ? contactTypes : ([contactTypes] as string[])
}

// produce a flat list of all contact types to be used in filtering
export const decorateContactTypes = ({
  contactTypeGroups,
  allContacts,
}: {
  contactTypeGroups: ContactGroupResponse[]
  allContacts: ContactSummaryResponse[]
}) =>
  contactTypeGroups
    .map(group => group.contactTypeCodes)
    .flat()
    .map(code => ({ code, count: 0, description: allContacts.find(contact => contact.code === code)?.descriptionType }))

// filter the list of contacts using the selected contact types
export const filterContacts = ({
  allContactTypes,
  filteredContacts,
  selectedContactTypes,
}: {
  allContactTypes: ContactTypeDecorated[]
  filteredContacts: ContactSummaryResponse[]
  selectedContactTypes?: string[]
}) =>
  filteredContacts.filter(contact => {
    const contactType = allContactTypes.find(type => type.code === contact.code)
    if (contactType) {
      contactType.count += 1
      contactType.description = contact.descriptionType
      return selectedContactTypes ? selectedContactTypes.includes(contact.code) : true
    }
    logger.error(`contact.code "${contact.code}" not found in contact types`)
    return undefined
  })

// details of applied filters, to be shown as 'tags' at the top of the filters panel; click on a tag to remove the filter
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
