import { ContactSummaryResponse } from '../../../@types/make-recall-decision-api'
import { ContactGroupResponse } from '../../../@types/make-recall-decision-api/models/ContactGroupResponse'
import { ContactHistoryFilters, ContactTypeGroupDecorated } from '../../../@types/contacts'
import { decorateSelectedFilters } from './helpers/decorateSelectedFilters'
import { decorateGroups } from './helpers/decorateGroups'
import { decorateAllContactTypes } from './helpers/decorateAllContactTypes'
import { listSelectedContactTypeCodes } from './helpers/listSelectedContactTypeCodes'
import { filterContactsBySelected } from './helpers/filterContactsBySelected'

export const filterContactsByContactType = ({
  filteredContacts,
  allContacts,
  contactTypeGroups,
  filters,
}: {
  filteredContacts: ContactSummaryResponse[]
  allContacts: ContactSummaryResponse[]
  contactTypeGroups: ContactGroupResponse[]
  filters: ContactHistoryFilters
}): {
  contacts: ContactSummaryResponse[]
  contactTypeGroups: ContactTypeGroupDecorated[]
  selected?: { text: string; href: string }[]
  selectedIds?: string[]
} => {
  const allContactTypes = decorateAllContactTypes({ contactTypeGroups, allContacts })
  const selectedContactTypes = listSelectedContactTypeCodes({ filters })
  const filteredByContactType = filterContactsBySelected({ allContactTypes, filteredContacts, selectedContactTypes })
  const contactTypeGroupsDecorated = decorateGroups({ allContactTypes, contactTypeGroups, selectedContactTypes })
  const selectedContactTypesRenderData = decorateSelectedFilters({ allContactTypes, selectedContactTypes, filters })
  return {
    contacts: filteredByContactType,
    contactTypeGroups: contactTypeGroupsDecorated,
    selected: selectedContactTypesRenderData,
    selectedIds: selectedContactTypes,
  }
}
