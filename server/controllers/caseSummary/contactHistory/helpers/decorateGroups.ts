import { ContactGroupResponse } from '../../../../@types/make-recall-decision-api/models/ContactGroupResponse'
import { sortList } from '../../../../utils/lists'
import { ContactTypeCode, ContactTypeDecorated } from '../../../../@types/contacts'
import { countLabelSuffix } from '../../../../utils/nunjucks'

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
      const contactTypeCodes: ContactTypeCode[] = []
      const contactTypeCodesSystemGenerated: ContactTypeCode[] = []
      group.contactTypeCodes.forEach(contactTypeCode => {
        const { description, count, systemGenerated } = allContactTypes.find(type => type.code === contactTypeCode)
        // include contact types with zero count, if they've already been selected
        if (count > 0 || (selectedContactTypes && selectedContactTypes.includes(contactTypeCode))) {
          ;(systemGenerated ? contactTypeCodesSystemGenerated : contactTypeCodes).push({
            value: contactTypeCode,
            description,
            html: `${description} <span class='text-secondary'>(<span data-qa='contact-count'>${count}<span class='govuk-visually-hidden'> ${countLabelSuffix(
              { count, label: 'contact' }
            )}</span></span>)</span>`,
            count,
            systemGenerated,
            attributes: {
              'data-group': group.label,
              'data-type': description,
            },
          })
        }
      })
      const isGroupOpen = selectedContactTypes
        ? Boolean(selectedContactTypes.find(selected => group.contactTypeCodes.includes(selected)))
        : false
      const contactCountInGroup = [...contactTypeCodes, ...contactTypeCodesSystemGenerated].reduce((count, type) => {
        return count + type.count
      }, 0)
      return {
        ...group,
        contactCountInGroup,
        isGroupOpen,
        contactTypeCodes: sortList(contactTypeCodes, 'description'),
        contactTypeCodesSystemGenerated: sortList(contactTypeCodesSystemGenerated, 'description'),
      }
    })
    .filter(group => group.isGroupOpen || group.contactCountInGroup > 0)
  return sortList(groups, 'label')
}
