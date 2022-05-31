import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import getContactTypes from '../../../../api/responses/get-contact-types.json'
import logger from '../../../../logger'
import { removeParamsFromQueryString } from '../../../utils/utils'
import { ObjectMap } from '../../../@types'
import { sortList } from '../../../utils/lists'

export const filterContactsByContactType = ({
  contacts,
  filters,
}: {
  contacts: ContactSummaryResponse[]
  filters: ObjectMap<string | string[]>
}): {
  contacts: ContactSummaryResponse[]
  contactTypes: { value: string; description: string; html: string; count: number }[]
  selected?: { text: string; href: string }[]
} => {
  const allContactTypes = getContactTypes.contactTypes.map(type => ({
    value: type.code,
    description: type.description,
    html: '',
    count: 0,
  }))
  const contactTypesFilter = filters.contactTypes
  const selectedContactTypes = Array.isArray(contactTypesFilter) ? contactTypesFilter : [contactTypesFilter]
  const filteredContacts = contacts.filter(contact => {
    const contactType = allContactTypes.find(type => type.value === contact.code)
    if (contactType) {
      contactType.count += 1
      return contactTypesFilter ? selectedContactTypes.includes(contact.code) : true
    }
    logger.error(`contact.code "${contact.code}" not found in contact types`)
    return undefined
  })
  const transformedContactTypes = allContactTypes
    .filter(type => type.count > 0)
    .map(type => ({
      ...type,
      html: `${type.description} <span class="text-secondary">(${type.count})</span>`,
    }))
  const sortedContactTypes = sortList(transformedContactTypes, 'count', false)
  return {
    contacts: filteredContacts,
    contactTypes: sortedContactTypes,
    selected: contactTypesFilter
      ? selectedContactTypes.map(id => ({
          text: allContactTypes.find(type => type.value === id)?.description,
          href: removeParamsFromQueryString({
            paramsToRemove: [{ key: 'contactTypes', value: id }],
            allParams: filters,
          }),
        }))
      : [],
  }
}
