import { ContactTypeDecorated } from '../../../../@types/contacts'
import { ContactSummaryResponse } from '../../../../@types/make-recall-decision-api'
import logger from '../../../../../logger'

// filter the list of contacts using the selected contact types
export const filterContactsBySelected = ({
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
