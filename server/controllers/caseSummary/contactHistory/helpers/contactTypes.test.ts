import { decorateGroups, parseSelectedFilters } from './contactTypes'
import { ContactHistoryFilters } from '../../../../@types'

describe('contactTypes helpers', () => {
  describe('parseSelectedFilters', () => {
    it('return undefined if given undefined contactTypes', () => {
      expect(parseSelectedFilters({ filters: { contactTypes: undefined } as ContactHistoryFilters })).toBeUndefined()
    })

    it('return undefined if given an empty string', () => {
      expect(parseSelectedFilters({ filters: { contactTypes: '' } as ContactHistoryFilters })).toBeUndefined()
    })

    it('returns an array if given a string', () => {
      const parsed = parseSelectedFilters({ filters: { contactTypes: 'IVSP' } as ContactHistoryFilters })
      expect(parsed).toEqual(['IVSP'])
    })

    it('returns an array if given an array of strings', () => {
      const parsed = parseSelectedFilters({ filters: { contactTypes: ['IVSP', 'EPOMAT'] } as ContactHistoryFilters })
      expect(parsed).toEqual(['IVSP', 'EPOMAT'])
    })
  })

  describe('decorateGroups', () => {
    const allContactTypes = [
      {
        code: 'IVSP',
        description: 'Arrest attempt',
        count: 5,
      },
      {
        code: 'C191',
        description: 'Management Oversight - Recall',
        count: 15,
      },
      {
        code: 'C002',
        description: 'Planned Office Visit (NS)',
        count: 0,
      },
    ]
    const contactTypeGroups = [
      {
        groupId: '1',
        label: 'Accredited programme',
        contactTypeCodes: ['IVSP'],
      },
      {
        groupId: '2',
        label: 'Appointments',
        contactTypeCodes: ['C191', 'C002'],
      },
    ]
    const selectedContactTypes = ['C191', 'IVSP']

    it('excludes contact types with zero count', () => {
      const groups = decorateGroups({ allContactTypes, contactTypeGroups, selectedContactTypes })
      const appointmentsGroup = groups.find(group => group.label === 'Appointments')
      expect(appointmentsGroup.contactTypeCodes.find(type => type.value === 'C002')).toBeUndefined()
    })

    it('excludes groups with zero total count, if none of their types are selected', () => {
      const groups = decorateGroups({
        allContactTypes: [
          {
            code: 'IVSP',
            description: 'Arrest attempt',
            count: 5,
          },
          {
            code: 'C191',
            description: 'Management Oversight - Recall',
            count: 0,
          },
          {
            code: 'C002',
            description: 'Planned Office Visit (NS)',
            count: 0,
          },
        ],
        contactTypeGroups,
        selectedContactTypes: ['IVSP'],
      })
      const appointmentsGroup = groups.find(group => group.label === 'Appointments')
      expect(appointmentsGroup).toBeUndefined()
    })

    it('includes groups with at least one type with a count, if the type is selected', () => {
      const groups = decorateGroups({
        allContactTypes: [
          {
            code: 'IVSP',
            description: 'Arrest attempt',
            count: 5,
          },
          {
            code: 'C191',
            description: 'Management Oversight - Recall',
            count: 3,
          },
          {
            code: 'C002',
            description: 'Planned Office Visit (NS)',
            count: 0,
          },
        ],
        contactTypeGroups,
        selectedContactTypes: ['IVSP', 'C191'],
      })
      const appointmentsGroup = groups.find(group => group.label === 'Appointments')
      expect(appointmentsGroup).toEqual({
        contactCountInGroup: 3,
        contactTypeCodes: [
          {
            count: 3,
            description: 'Management Oversight - Recall',
            html: 'Management Oversight - Recall <span class="text-secondary">(<span data-qa=\'contact-count\'>3</span>)</span>',
            value: 'C191',
          },
        ],
        groupId: '2',
        isGroupOpen: true, // open the group because one of its types is selected
        label: 'Appointments',
      })
    })

    it('includes groups with at least one type with a count, if the type is not selected', () => {
      const groups = decorateGroups({
        allContactTypes: [
          {
            code: 'IVSP',
            description: 'Arrest attempt',
            count: 5,
          },
          {
            code: 'C191',
            description: 'Management Oversight - Recall',
            count: 3,
          },
          {
            code: 'C002',
            description: 'Planned Office Visit (NS)',
            count: 0,
          },
        ],
        contactTypeGroups,
        selectedContactTypes: ['IVSP'],
      })
      const appointmentsGroup = groups.find(group => group.label === 'Appointments')
      expect(appointmentsGroup).toEqual({
        contactCountInGroup: 3,
        contactTypeCodes: [
          {
            count: 3,
            description: 'Management Oversight - Recall',
            html: 'Management Oversight - Recall <span class="text-secondary">(<span data-qa=\'contact-count\'>3</span>)</span>',
            value: 'C191',
          },
        ],
        groupId: '2',
        isGroupOpen: false, // close the group because none of its types are selected
        label: 'Appointments',
      })
    })
  })
})
