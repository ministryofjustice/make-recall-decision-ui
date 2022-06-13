import { ContactTypeDecorated, ContactHistoryFilters, ObjectMap } from '../../../../@types'
import { isDefined, removeParamsFromQueryString } from '../../../../utils/utils'
import { ContactTypeGroup } from '../../../../@types/make-recall-decision-api/models/ContactTypeGroup'
import { sortList } from '../../../../utils/lists'
import { ContactSummaryResponse } from '../../../../@types/make-recall-decision-api'
import logger from '../../../../../logger'

export const parseSelectedFilters = ({ filters }: { filters: ContactHistoryFilters }) => {
  const { contactTypes } = filters
  if (!isDefined(contactTypes) || contactTypes === '') {
    return undefined
  }
  return Array.isArray(contactTypes) ? contactTypes : ([contactTypes] as string[])
}

export const decorateContactTypes = ({
  contactTypeGroups,
  allContacts,
}: {
  contactTypeGroups: ContactTypeGroup[]
  allContacts: ContactSummaryResponse[]
}) =>
  contactTypeGroups
    .map(group => group.contactTypeCodes)
    .flat()
    .map(code => ({ code, count: 0, description: allContacts.find(contact => contact.code === code)?.descriptionType }))

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

export const decorateGroups = ({
  allContactTypes,
  contactTypeGroups,
  selectedContactTypes,
}: {
  allContactTypes: ContactTypeDecorated[]
  contactTypeGroups: ContactTypeGroup[]
  selectedContactTypes?: string[]
}) =>
  contactTypeGroups
    .map(group => {
      const contactTypeCodes = group.contactTypeCodes
        .map(code => {
          const { description, count } = allContactTypes.find(type => type.code === code)
          return {
            value: code,
            description,
            html: `${description} <span class="text-secondary">(<span data-qa='contact-count'>${count}</span>)</span>`,
            count,
          }
        })
        .filter(type => type.count > 0)
      const isGroupOpen = selectedContactTypes
        ? Boolean(selectedContactTypes.find(selected => group.contactTypeCodes.includes(selected)))
        : false
      const contactCountInGroup = contactTypeCodes.reduce((count, type) => {
        return count + type.count
      }, 0)
      return {
        ...group,
        contactCountInGroup,
        isGroupOpen,
        contactTypeCodes: sortList(contactTypeCodes, 'description'),
      }
    })
    .filter(group => group.isGroupOpen || group.contactCountInGroup > 0)

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
