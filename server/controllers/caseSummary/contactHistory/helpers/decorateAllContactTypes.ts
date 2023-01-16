// produce a flat list of all contact types in the current result set
import { ContactGroupResponse, ContactSummaryResponse } from '../../../../@types/make-recall-decision-api'

export const decorateAllContactTypes = ({
  contactTypeGroups,
  allContacts,
}: {
  contactTypeGroups: ContactGroupResponse[]
  allContacts: ContactSummaryResponse[]
}) =>
  contactTypeGroups
    .map(group => group.contactTypeCodes)
    .flat()
    .map(code => {
      const contact = allContacts.find(({ code: c }) => c === code)
      return { code, count: 0, description: contact?.descriptionType, systemGenerated: contact?.systemGenerated }
    })
