import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import { ContactHistoryFilters, ContactTypeGroupDecorated } from '../../../@types'
import { ContactTypeGroup } from '../../../@types/make-recall-decision-api/models/ContactTypeGroup'
import {
  decorateContactTypes,
  decorateGroups,
  decorateSelectedFilters,
  filterContacts,
  parseSelectedFilters,
} from './helpers/contactTypes'

export const filterContactsByContactType = ({
  filteredContacts,
  allContacts,
  contactTypeGroups,
  filters,
}: {
  filteredContacts: ContactSummaryResponse[]
  allContacts: ContactSummaryResponse[]
  contactTypeGroups: ContactTypeGroup[]
  filters: ContactHistoryFilters
}): {
  contacts: ContactSummaryResponse[]
  contactTypeGroups: ContactTypeGroupDecorated[]
  selected?: { text: string; href: string }[]
} => {
  const allContactTypes = decorateContactTypes({ contactTypeGroups, allContacts })
  const selectedContactTypes = parseSelectedFilters({ filters })
  const filteredByContactType = filterContacts({ allContactTypes, filteredContacts, selectedContactTypes })
  const contactTypeGroupsDecorated = decorateGroups({ allContactTypes, contactTypeGroups, selectedContactTypes })
  const selectedContactTypesRenderData = decorateSelectedFilters({ allContactTypes, selectedContactTypes, filters })
  return {
    contacts: filteredByContactType,
    contactTypeGroups: contactTypeGroupsDecorated,
    selected: selectedContactTypesRenderData,
  }
}
