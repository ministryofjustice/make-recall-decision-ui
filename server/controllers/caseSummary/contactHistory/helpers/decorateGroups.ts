import { ContactGroupResponse } from '../../../../@types/make-recall-decision-api/models/ContactGroupResponse'
import { sortList } from '../../../../utils/lists'
import { ContactTypeDecorated } from '../../../../@types/contactTypes'

// add data for each group and its contacts, for display as filter checkboxes
export const decorateGroups = ({
  allContactTypes,
  contactTypeGroups,
  selectedContactTypes,
}: {
  allContactTypes: ContactTypeDecorated[]
  contactTypeGroups: ContactGroupResponse[]
  selectedContactTypes?: string[]
}) => {
  const groups = contactTypeGroups
    .map(group => {
      const contactTypeCodes = group.contactTypeCodes
        .map(code => {
          const { description, count } = allContactTypes.find(type => type.code === code)
          return {
            value: code,
            description,
            html: `${description} <span class='text-secondary'>(<span data-qa='contact-count'>${count}</span>)</span>`,
            count,
            attributes: {
              'data-group': group.label,
              'data-type': description,
            },
          }
        })
        // include contact types with zero count, if they've already been selected
        .filter(type => type.count > 0 || (selectedContactTypes && selectedContactTypes.includes(type.value)))
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
  return sortList(groups, 'label')
}
